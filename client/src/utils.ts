// TYPESCRIPT UTILS
import type { User, Group, Message } from "@types";
import type { Dispatch } from "react";

export type ChatKind = "group" | "conversation";

export type MessageResponse = {message: Omit<Message, "id" | "senderId"> & { sender: { name: string } }};
export type GroupResponse = Omit<Group, "id">;
export type Contact = Omit<User, "id" | "email" | "password_hash">;
export type UserResponse = Omit<User, "id" | "password_hash">;

export interface ChatType<T extends Contact | GroupResponse> {
  chat: T,
  lastMessage: MessageResponse
}

// REACT UTILS

import { createContext } from "react";

export const SelectedChatContext = createContext<{
  selectedChat: { kind: ChatKind, name: string } | null,
  setSelectedChat: Dispatch<React.SetStateAction<{ kind: ChatKind, name: string } | null>>
}>({
  selectedChat: null,
  setSelectedChat: () => {}
});