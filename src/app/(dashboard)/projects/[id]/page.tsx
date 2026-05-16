"use client";

import { Suspense, use, useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, Loader2, Shield, Users } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCard } from "@/components/tasks/task-card";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { CreateTaskGroupDialog } from "@/components/projects/create-task-group-dialog";
import { DiscordDiscussionsView } from "@/components/discussions/discord-discussions-view";
import type { DiscussionChannelItem } from "@/components/discussions/discussion-channel-sidebar";
import { ProjectJoinCodeCard } from "@/components/projects/project-join-code-card";
import { ProjectActionMenu } from "@/components/projects/project-action-menu";
import { useProject } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

interface TaskGroup {
  _id: string;
  name: string;
  icon?: string;
  permission?: "admin" | "open";
}

interface ProjectDetailData {
  project: {
    _id: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    joinCode?: string;
    owner: string | { _id: string };
    members: Array<{
      user: { _id: string; name: string; email?: string; avatar?: string };
      role: string;
    }>;
  };
  taskGroups: TaskGroup[];
  canManage?: boolean;
  tasks: Array<{
    _id: string;
    title: string;
    description?: string;
    status: "pending" | "accepted" | "rejected" | "in_progress" | "completed";
    priority: "low" | "medium" | "high" | "urgent";
    dueDate?: string;
    taskGroup?: string;
    assignedTo?: { _id: string; name: string; avatar?: string };
    createdBy?: { _id: string; name: string; avatar?: string };
  }>;
}

function toId(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

function ProjectDetailContent({
  id,
}: {
  id: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { data, isLoading, refetch } = useProject(id);

  const tabParam = searchParams.get("tab");
  const channelParam = searchParams.get("channel");
  const [activeTab, setActiveTab] = useState(
    tabParam === "discussions" || tabParam === "members" ? tabParam : "tasks"
  );
  const [activeDiscussion, setActiveDiscussion] = useState<string | null>(
    channelParam
  );
  const [activeTaskGroup, setActiveTaskGroup] = useState<string | "all">("all");
  const [joinCodeOpen, setJoinCodeOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);

  useEffect(() => {
    if (tabParam === "discussions" || tabParam === "members" || tabParam === "tasks") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (channelParam) setActiveDiscussion(channelParam);
  }, [channelParam]);

  const detail = data as ProjectDetailData | undefined;

  useEffect(() => {
    if (!isLoading && detail?.canManage && detail.project && !detail.project.joinCode) {
      refetch();
    }
  }, [isLoading, detail?.canManage, detail?.project?.joinCode, refetch, detail?.project]);
  const project = detail?.project;
  const taskGroups = detail?.taskGroups || [];

  const tasksByGroup = useMemo(() => {
    const tasks = detail?.tasks || [];
    if (activeTaskGroup === "all") return tasks;
    return tasks.filter((t) => {
      const tg = t.taskGroup as string | { _id?: string } | undefined;
      const id = typeof tg === "object" && tg !== null ? tg._id : tg;
      return id?.toString() === activeTaskGroup;
    });
  }, [detail?.tasks, activeTaskGroup]);

  const discussionChannels: DiscussionChannelItem[] = useMemo(
    () =>
      (detail?.taskGroups || []).map((g) => ({
        _id: toId(g._id),
        name: g.name,
        description: undefined,
        icon: g.icon,
        permission: g.permission,
      })),
    [detail?.taskGroups]
  );

  useEffect(() => {
    if (channelParam) {
      const match = discussionChannels.find((d) => d._id === channelParam);
      if (match) setActiveDiscussion(match._id);
    } else {
      setActiveDiscussion(null);
    }
  }, [discussionChannels, channelParam]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-slate-500">Project not found</p>
        <Link href="/dashboard" className="text-indigo-600 text-sm mt-2 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const myRole = project.members?.find(
    (m) => toId(m.user?._id) === session?.user?.id
  )?.role;
  const isOwner = session?.user?.id === toId(project.owner);
  const canManage =
    detail?.canManage === true ||
    isOwner ||
    myRole === "owner" ||
    myRole === "admin";
  const canCreateAdminGroup = canManage;

  const selectedDiscussion =
    detail?.taskGroups?.find((d) => toId(d._id) === activeDiscussion) ||
    detail?.taskGroups?.find((d) => toId(d._id) === channelParam) ||
    detail?.taskGroups?.[0];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams();
    params.set("tab", value);
    if (value === "discussions" && activeDiscussion) {
      params.set("channel", activeDiscussion);
    }
    router.replace(`/projects/${id}?${params.toString()}`, { scroll: false });
  };

  const handleDiscussionSelect = (projectId: string, channelId: string) => {
    const gid = toId(channelId);
    setActiveDiscussion(gid);
    router.replace(
      `/projects/${id}?tab=discussions&channel=${gid}`,
      { scroll: false }
    );
  };

  const handleDiscussionProjectSelect = (projectId: string | null) => {
    if (!projectId) {
      router.replace(`/projects/${id}?tab=discussions`, { scroll: false });
      return;
    }
    router.replace(`/projects/${id}?tab=discussions`, { scroll: false });
  };

  const isDiscussionsTab = activeTab === "discussions";

  return (
    <div
      className={cn(
        "flex flex-col",
        isDiscussionsTab &&
          "h-[calc(100dvh-5rem)] overflow-hidden lg:h-auto lg:min-h-[calc(100vh-4rem)] lg:overflow-visible"
      )}
    >
      <Header title={project.name} subtitle={project.description} backHref="/dashboard" />
      <div
        className={cn(
          "max-w-7xl mx-auto w-full flex flex-col",
          isDiscussionsTab
            ? "flex-1 min-h-0 px-4 lg:px-6 pt-0 pb-0 gap-3"
            : "p-4 lg:p-6 pt-0 space-y-4"
        )}
      >

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className={cn(isDiscussionsTab && "flex flex-col flex-1 min-h-0")}
        >
          <div className="flex flex-wrap items-center justify-between shrink-0 border-b border-slate-200">
            <TabsList className="w-auto border-none">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>
            {canManage && (
              <Button
                type="button"
                variant={joinCodeOpen ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5 h-8 mb-1 text-slate-600 hover:text-slate-900"
                onClick={() => setJoinCodeOpen((open) => !open)}
              >
                <KeyRound className="h-4 w-4" />
                Join code
              </Button>
            )}
          </div>

          {joinCodeOpen && canManage && (
            project.joinCode ? (
              <ProjectJoinCodeCard
                joinCode={project.joinCode}
                className="shrink-0"
                onClose={() => setJoinCodeOpen(false)}
              />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 shrink-0">
                Loading join code…
              </div>
            )
          )}

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
              <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTaskGroup("all")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTaskGroup === "all"
                      ? "bg-white text-[var(--primary)] shadow-sm ring-1 ring-slate-200/50"
                      : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  All ({detail?.tasks?.length || 0})
                </button>
                {taskGroups.map((g) => (
                  <button
                    key={g._id}
                    type="button"
                    onClick={() => setActiveTaskGroup(g._id)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      activeTaskGroup === g._id
                        ? "bg-white text-[var(--primary)] shadow-sm ring-1 ring-slate-200/50"
                        : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                  >
                    {g.permission === "admin" ? (
                      <Shield className="h-3.5 w-3.5 text-slate-400" />
                    ) : (
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    {g.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <ProjectActionMenu
                  onAddGroup={() => setGroupDialogOpen(true)}
                  onAddTask={() => setTaskDialogOpen(true)}
                  canCreateAdminGroup={canCreateAdminGroup}
                />
                <CreateTaskGroupDialog
                  projectId={id}
                  canCreateAdminGroup={canCreateAdminGroup}
                  open={groupDialogOpen}
                  onOpenChange={setGroupDialogOpen}
                />
                <CreateTaskDialog 
                  projectId={id} 
                  taskGroups={taskGroups}
                  open={taskDialogOpen}
                  onOpenChange={setTaskDialogOpen}
                />
              </div>
            </div>

            <div className="grid gap-3">
              {tasksByGroup.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center rounded-xl border border-dashed border-slate-200 bg-white">
                  {taskGroups.length === 0
                    ? "Create a task group first, then add tasks."
                    : "No tasks in this group yet."}
                </p>
              ) : (
                tasksByGroup.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    currentUserId={session?.user?.id}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="discussions"
            className="flex-1 min-h-0 mt-2 p-0 flex flex-col focus-visible:outline-none"
          >
            <div className="flex-1 min-h-0 overflow-hidden -mx-4 lg:mx-0 border-t border-slate-200 lg:border-0 lg:rounded-xl lg:border lg:border-slate-200">
              <DiscordDiscussionsView
                project={{
                  _id: id,
                  name: project.name,
                  color: project.color,
                  icon: project.icon,
                  channels: discussionChannels,
                }}
                initialChannelId={channelParam}
                onChannelChange={handleDiscussionSelect}
                canCreateAdminGroup={canCreateAdminGroup}
              />
            </div>
          </TabsContent>

          <TabsContent value="members">
            <div className="grid gap-3 sm:grid-cols-2">
              {project.members?.map((member, index) => {
                if (!member || !member.user) return null;

                const initials = member.user.name
                  ? member.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "?";

                return (
                  <div
                    key={member.user._id || index}
                    className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-sm"
                  >
                    <Avatar>
                      <AvatarImage src={member.user.avatar} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {member.user.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {member.user.email}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {member.role}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ProjectDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      }
    >
      <ProjectDetailContent id={params.id} />
    </Suspense>
  );
}
