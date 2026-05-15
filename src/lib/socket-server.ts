import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

export type SocketServer = SocketIOServer;

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join:user", (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on("join:project", (projectId: string) => {
      socket.join(`project:${projectId}`);
    });

    socket.on("join:discussion", (groupId: string) => {
      socket.join(`discussion:${groupId}`);
    });

    socket.on("leave:discussion", (groupId: string) => {
      socket.leave(`discussion:${groupId}`);
    });

    socket.on("typing:start", ({ groupId, user }) => {
      socket.to(`discussion:${groupId}`).emit("typing:start", { groupId, user });
    });

    socket.on("typing:stop", ({ groupId, user }) => {
      socket.to(`discussion:${groupId}`).emit("typing:stop", { groupId, user });
    });

    socket.on("disconnect", () => {});
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function emitToUser(userId: string, event: string, data: unknown) {
  io?.to(`user:${userId}`).emit(event, data);
}

export function emitToDiscussion(
  groupId: string,
  event: string,
  data: unknown
) {
  io?.to(`discussion:${groupId}`).emit(event, data);
}

export function emitToProject(
  projectId: string,
  event: string,
  data: unknown
) {
  io?.to(`project:${projectId}`).emit(event, data);
}
