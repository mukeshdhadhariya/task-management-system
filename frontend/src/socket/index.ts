import { io, type Socket } from "socket.io-client";
import { getStoredToken } from "../api/http";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000";

export type TaskSocketEventName = "task:created" | "task:updated" | "task:deleted";

export interface TaskSocketEventPayload {
  task: {
    id: string;
    assignedToId: string;
    title?: string;
  };
  actorUserId: string;
}

let socket: Socket | null = null;

const getAuthPayload = () => {
  const token = getStoredToken();
  return token ? { token } : {};
};

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      auth: getAuthPayload(),
    });
  }

  return socket;
};

export const connectSocket = () => {
  const instance = getSocket();
  instance.auth = getAuthPayload();

  if (!instance.connected) {
    instance.connect();
  }

  return instance;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.auth = {};
  }
  socket?.disconnect();
};

export const subscribeToTaskEvents = (
  onEvent: (eventName: TaskSocketEventName, payload: TaskSocketEventPayload) => void
) => {
  const instance = getSocket();

  const createdHandler = (payload: TaskSocketEventPayload) => onEvent("task:created", payload);
  const updatedHandler = (payload: TaskSocketEventPayload) => onEvent("task:updated", payload);
  const deletedHandler = (payload: TaskSocketEventPayload) => onEvent("task:deleted", payload);

  instance.on("task:created", createdHandler);
  instance.on("task:updated", updatedHandler);
  instance.on("task:deleted", deletedHandler);

  return () => {
    instance.off("task:created", createdHandler);
    instance.off("task:updated", updatedHandler);
    instance.off("task:deleted", deletedHandler);
  };
};

export const subscribeToTaskUpdates = (onChange: () => void) => {
  return subscribeToTaskEvents(() => onChange());
};