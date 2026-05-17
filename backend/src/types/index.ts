import type { JwtPayload } from "jsonwebtoken";

export type SocketUser = {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
};

export type TaskEventName = "task:created" | "task:updated" | "task:deleted";

export type TaskEventPayload = {
  task: {
    id: string;
    assignedToId: string;
  };
  actorUserId: string;
};

export type SocketTokenPayload = JwtPayload & { id?: string };

export const taskRooms = (assignedToId: string) => [`user:${assignedToId}`, "admins"];
