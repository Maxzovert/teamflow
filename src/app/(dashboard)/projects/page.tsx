"use client";

import { FolderKanban, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { ProjectCard, type ProjectData } from "@/components/projects/project-card";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { JoinProjectDialog } from "@/components/projects/join-project-dialog";
import { useProjects } from "@/hooks/use-api";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();

  return (
    <div>
      <Header
        title="Projects"
        subtitle="Manage your team projects"
      />
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            {Array.isArray(projects) ? projects.length : 0} projects
          </p>
          <div className="flex flex-wrap gap-2">
            <JoinProjectDialog />
            <CreateProjectDialog />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : !projects || !Array.isArray(projects) || projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderKanban className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No projects yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Create your first project to start collaborating with your team.
            </p>
            <div className="mt-6">
              <CreateProjectDialog />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(projects as ProjectData[]).map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
