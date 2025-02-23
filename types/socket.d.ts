import type { Room, User } from '@prisma/client';
import type { Server, Socket } from 'socket.io';

interface SendMsgPayload {
  targetId: string;
  chatId?: number;
  message: {
    text: string;
    // image?: File; // To be added later
  };
}

export interface ClientToServerEvents {
  createChatRoom: (userId: string) => void;
  sendMessage: (p: SendMsgPayload) => void;
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
