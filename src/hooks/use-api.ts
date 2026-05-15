"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { normalizeChatMessage } from "@/lib/chat-message";
import { useChatStore } from "@/stores/chat-store";

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Request failed");
  return json.data;
}

export function useProjects(enabled = true) {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchApi("/api/projects"),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchApi(`/api/projects/${id}`),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useTodos() {
  return useQuery({
    queryKey: ["todos"],
    queryFn: () => fetchApi("/api/todos"),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchApi("/api/notifications"),
    staleTime: 30 * 1000,
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchApi("/api/dashboard"),
  });
}

export function useHomeDashboard() {
  return useQuery({
    queryKey: ["home"],
    queryFn: () => fetchApi("/api/dashboard/home"),
  });
}

export function useCreateTaskGroup(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      permission: "admin" | "open";
    }) =>
      fetchApi(`/api/projects/${projectId}/task-groups`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
    },
  });
}

export function useMyDiscussions() {
  return useQuery({
    queryKey: ["discussions"],
    queryFn: () => fetchApi("/api/discussions"),
  });
}

export function useDiscussionContext(groupId: string) {
  return useQuery({
    queryKey: ["discussion", groupId],
    queryFn: () => fetchApi(`/api/discussions/${groupId}`),
    enabled: !!groupId,
    staleTime: 60 * 1000,
  });
}

export function useCreateDiscussionGroup(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      permission?: "open" | "admin";
    }) =>
      fetchApi(`/api/projects/${projectId}/discussions`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useReactToMessage(groupId: string) {
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      fetchApi(`/api/discussions/${groupId}/messages/${messageId}/react`, {
        method: "POST",
        body: JSON.stringify({ emoji }),
      }),
  });
}

export function useMarkMessageRead(groupId: string) {
  return useMutation({
    mutationFn: (messageId: string) =>
      fetchApi(`/api/discussions/${groupId}/messages/${messageId}/read`, {
        method: "POST",
      }),
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Upload failed");
      return json.data as { name: string; url: string; type: string; size: number };
    },
  });
}

export function useTasks(projectId?: string, assignedToMe?: boolean) {
  const params = new URLSearchParams();
  if (projectId) params.set("projectId", projectId);
  if (assignedToMe) params.set("assignedToMe", "true");

  return useQuery({
    queryKey: ["tasks", projectId, assignedToMe],
    queryFn: () => fetchApi(`/api/tasks?${params}`),
  });
}

export function useUsers(search?: string) {
  return useQuery({
    queryKey: ["users", search],
    queryFn: () =>
      fetchApi(`/api/users${search ? `?search=${encodeURIComponent(search)}` : ""}`),
    enabled: search ? search.length >= 2 : true,
  });
}

export function useUpdateProjectIcon(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (icon: string) =>
      fetchApi(`/api/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({ icon }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useJoinProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) =>
      fetchApi("/api/projects/join", {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      color?: string;
      icon?: string;
    }) =>
      fetchApi("/api/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
    },
  });
}

export function useRespondToTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      ...data
    }: {
      taskId: string;
      action: "accept" | "reject";
      notes?: string;
      reason?: string;
    }) =>
      fetchApi(`/api/tasks/${taskId}/respond`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi("/api/todos", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; completed?: boolean }) =>
      fetchApi(`/api/todos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useMessages(groupId: string) {
  return useQuery({
    queryKey: ["messages", groupId],
    queryFn: () => fetchApi(`/api/discussions/${groupId}/messages`),
    enabled: !!groupId,
    staleTime: 15 * 1000,
  });
}

export function useSendMessage(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string; attachments?: unknown[] }) =>
      fetchApi(`/api/discussions/${groupId}/messages`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (message) => {
      const normalized = normalizeChatMessage(
        message as Record<string, unknown>,
        groupId
      );
      useChatStore.getState().addMessage(normalized);
      queryClient.setQueryData(["messages", groupId], (old: unknown) => {
        const list = Array.isArray(old) ? old : [];
        if (list.some((m: { _id?: string }) => m._id === normalized._id)) {
          return list;
        }
        return [...list, message];
      });
    },
  });
}

export function useMarkMessagesRead(groupId: string) {
  return useMutation({
    mutationFn: (messageIds: string[]) =>
      fetchApi(`/api/discussions/${groupId}/messages/read`, {
        method: "POST",
        body: JSON.stringify({ messageIds }),
      }),
  });
}

export function useMarkNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      fetchApi("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ notificationId }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchApi("/api/profile"),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name?: string;
      avatar?: string;
      designation?: string;
    }) =>
      fetchApi("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useMarkAllNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchApi("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ markAllRead: true }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
