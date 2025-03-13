import type { ChatSummary } from '@/controller/chat.controller';
import type { Chat, Message, Room, User } from '@prisma/client';
import type { Server, Socket } from 'socket.io';

interface SendMsgPayload {
  chatId: number;
  message: {
    text: string;
    // image?: File; // To be added later
  };
}

export interface ClientToServerEvents {
  markChatAsRead: (id: number) => void;
  sendMessage: (p: SendMsgPayload, ack: (m: Message) => void) => void;
  createChat: (targetId: number, ack: (c: ChatSummary) => void) => void;
}

export interface ServerToClientEvents {
  readChat: (id: number) => void;
  newMessage: (m: Message) => void;
  newChat: (c: ChatSummary) => void;
  newNotification: (notif: INotification) => void;
  userConnected: (user: Partial<User>) => void;
  userDisconnected: (user: Partial<User>) => void;
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
