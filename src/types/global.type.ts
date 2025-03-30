import { Socket, Server as NetServer } from "net";
import { Server as SocketIOServer } from "socket.io";
import { NextApiResponse } from "next";

export type PermissionsKey = keyof typeof Permissions;
export type DirectionType = "workspace" | "folder";
export enum Permissions {
  private = "Private",
  shared = "Shared",
}

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export interface EditorCollaborator {
  id: string;
  email: string;
  avatarUrl: string;
  presence_ref: string;
}
