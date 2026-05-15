"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useJoinProject } from "@/hooks/use-api";

function toId(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

export function JoinProjectDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const joinProject = useJoinProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const project = (await joinProject.mutateAsync(code)) as { _id: unknown };
    setCode("");
    setOpen(false);
    router.push(`/projects/${toId(project._id)}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <LogIn className="h-4 w-4" />
          Join project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="join-code">Project code</Label>
            <Input
              id="join-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. AB12CD34"
              className="font-mono tracking-widest uppercase"
              autoComplete="off"
              required
            />
            <p className="text-xs text-slate-500">
              Ask a project admin for the join code.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={joinProject.isPending}>
            {joinProject.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Join"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
