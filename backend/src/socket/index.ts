import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import type { Socket } from "socket.io";
import { Server } from "socket.io";

import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apierror";
import type {
  SocketTokenPayload,
  SocketUser,
  TaskEventName,
  TaskEventPayload,
} from "../types";

let io: Server | undefined;

const getToken = (socket: Socket) => {
  const cookieHeader = socket.handshake.headers.cookie;
  if (typeof cookieHeader === "string") {
    const accessTokenCookie = cookieHeader
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("accessToken="));

    if (accessTokenCookie) {
      return decodeURIComponent(accessTokenCookie.split("=")[1] ?? "");
    }

    const legacyTokenCookie = cookieHeader
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("token="));

    if (legacyTokenCookie) {
      return decodeURIComponent(legacyTokenCookie.split("=")[1] ?? "");
    }
  }

  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.length > 0) {
    return authToken;
  }

  const authorization = socket.handshake.headers.authorization;
  if (typeof authorization === "string" && authorization.startsWith("Bearer ")) {
    return authorization.slice(7);
  }

  return undefined;
};

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = getToken(socket);

    if (!token) {
      return next(new ApiError(401, "token is missing"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as SocketTokenPayload;

      if (!decoded.id) {
        return next(new ApiError(401, "Invalid token"));
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        return next(new ApiError(401, "User is not found"));
      }

      socket.data.user = user;
      next();
    } catch {
      next(new ApiError(401, "Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as SocketUser;

    socket.join(`user:${user.id}`);

    if (user.role === "ADMIN") {
      socket.join("admins");
    }
  });

  return io;
};

export const emitTaskEvent = (
  eventName: TaskEventName,
  payload: TaskEventPayload,
  roomNames: string[]
) => {
  io?.to(roomNames).emit(eventName, payload);
};
