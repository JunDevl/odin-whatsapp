import type { User, Group, Message } from "@types";

export type ChatKind = "group" | "conversation";

export type MessageResponse = Omit<Message, "id" | "senderId">;
export type GroupResponse = Omit<Group, "id">;
export type Contact = Omit<User, "id" | "email" | "password_hash">;
export type UserResponse = Omit<User, "id" | "password_hash">;

export interface ChatType<T extends Contact | GroupResponse> {
  chat: T,
  lastMessage: MessageResponse
}