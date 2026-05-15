"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { FolderKanban, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getProjectDisplayIcon } from "@/lib/project-icon";
import { formatRelativeTime } from "@/lib/utils";

interface ProjectMember {
  user: { _id: string; name: string; avatar?: string };
  role: string;
}

export interface ProjectData {
  _id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  owner: string | { _id: string };
  members: ProjectMember[];
  updatedAt: string;
}

interface ProjectCardProps {
  project: ProjectData;
}

function toId(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { data: session } = useSession();
  const isOwner = session?.user?.id === toId(project.owner);

  return (
    <Link href={`/projects/${project._id}`}>
      <Card animate className="h-full hover:border-violet-500/40 transition-colors cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
              style={{ backgroundColor: `${project.color}30` }}
            >
              {project.icon ? (
                getProjectDisplayIcon(project.icon)
              ) : (
                <FolderKanban
                  className="h-6 w-6"
                  style={{ color: project.color }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{project.name}</h3>
                {isOwner && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px] uppercase tracking-wide"
                  >
                    Own
                  </Badge>
                )}
              </div>
              {project.description && (
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {project.members.length} members
                </span>
                <span>Updated {formatRelativeTime(project.updatedAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

