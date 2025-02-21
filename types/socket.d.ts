import type { Room, User } from '@prisma/client';
import type { Server, Socket } from 'socket.io';

export interface ClientToServerEvents {
  createChatRoom: (userId: string) => void;
  sendMessage: (e: { text: string; image? }) => void;
}

export interface ServerToClientEvents {
  newMessage: (e: { text: string; image? }) => void;
  newChatRoom: (room: Room) => void;
  newNotification: (notif: INotification) => void;
}

export interface UserData {
  user: User;
}

export type IServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  UserData
>;
