"use client";

import { Suspense, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { DiscordDiscussionsView, type DiscordProjectGroup } from "@/components/discussions/discord-discussions-view";
import { useMyDiscussions, useProjects } from "@/hooks/use-api";

interface DiscussionChannel {
  _id: string;
  name: string;
  description?: string;
  permission?: "open" | "admin";
  project: { _id: string; name: string; color: string; icon?: string };
}

function toId(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

function DiscussionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { data, isLoading } = useMyDiscussions();
  const { data: projectsData } = useProjects();
  const channels = (data as DiscussionChannel[]) || [];

  const channelParam = searchParams.get("channel");
  const projectParam = searchParams.get("project");

  const projects: DiscordProjectGroup[] = useMemo(() => {
    const map = new Map<string, DiscordProjectGroup>();

    for (const ch of channels) {
      const project = {
        _id: toId(ch.project._id),
        name: ch.project.name,
        color: ch.project.color || "#5865f2",
        icon: ch.project.icon,
      };
      if (!map.has(project._id)) {
        map.set(project._id, { ...project, channels: [] });
      }
      map.get(project._id)!.channels.push({
        _id: toId(ch._id),
        name: ch.name,
        description: ch.description,
        permission: ch.permission,
      });
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [channels]);

  const initialProject = useMemo(() => {
    if (projectParam && projects.some((p) => p._id === projectParam)) {
      return projectParam;
    }
    if (channelParam) {
      const ch = channels.find((c) => toId(c._id) === channelParam);
      if (ch) return toId(ch.project._id);
    }
    return null;
  }, [projectParam, channelParam, projects, channels]);

  const selectedProjectId = projectParam ?? initialProject;

  const canCreateAdminGroup = useMemo(() => {
    if (!selectedProjectId || !session?.user?.id) return false;
    const full = (projectsData as Array<{
      _id: string;
      members: Array<{ user: { _id: string }; role: string }>;
    }>)?.find((p) => toId(p._id) === selectedProjectId);
    const member = full?.members?.find(
      (m) => toId(m.user._id) === session.user.id
    );
    return member?.role === "owner" || member?.role === "admin";
  }, [projectsData, selectedProjectId, session?.user?.id]);

  const handleProjectChange = (projectId: string | null) => {
    if (!projectId) {
      router.replace("/discussions", { scroll: false });
      return;
    }
    router.replace(`/discussions?project=${projectId}`, { scroll: false });
  };

  const handleChannelChange = (projectId: string, channelId: string) => {
    router.replace(`/discussions?project=${projectId}&channel=${channelId}`, {
      scroll: false,
    });
  };

  return (
    <DiscordDiscussionsView
        className="h-full"
        projects={projects}
        isLoading={isLoading}
        initialProjectId={initialProject}
        initialChannelId={channelParam}
        onProjectChange={handleProjectChange}
        onChannelChange={handleChannelChange}
        addMenuMode="global"
        canCreateAdminGroup={canCreateAdminGroup}
      />
  );
}

export default function DiscussionsPage() {
  return (
    <Suspense fallback={null}>
      <DiscussionsContent />
    </Suspense>
  );
}
