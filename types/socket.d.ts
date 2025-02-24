import type { Message, Room, User } from '@prisma/client';
import type { Server, Socket } from 'socket.io';

interface SendMsgPayload {
  targetId: number;
  chatId: number;
  message: {
    text: string;
    // image?: File; // To be added later
  };
}

interface NewMsgPayload {
  chatId: number;
  message: Message;
}

export interface ClientToServerEvents {
  readChat: (id: number) => void;
  sendMessage: (p: SendMsgPayload) => void;
  createChat: (targetId: number) => void;
}

export interface ServerToClientEvents {
  chatCreated: (c: chat) => void; // Response to the one who create the chat room
  newMessage: (e: NewMsgPayload) => void;
  newChat: (c: Chat) => void; // Response to member
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
