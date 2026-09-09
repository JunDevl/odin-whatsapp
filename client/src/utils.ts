// TYPESCRIPT UTILS
import type { User, Group, MemberOfGroup, Message } from "@types";
import type { Dispatch } from "react";

export type MessageResponse = Omit<Message, "sentAt" | "editedAt" | "deletedAt" | "senderId"> & { 
  sender: { name: string },
  sentAt: string,
  editedAt: string | null,
  deletedAt: string | null
}

export type Contact = Omit<User, "id" | "email" | "password_hash">;

export type GroupResponse = Omit<Group, "createdAt"> & {createdAt: string}; 

export type UserResponse = Omit<User, "id" | "password_hash">;

export type GroupMemberResponse = Omit<MemberOfGroup, "userId" | "joinedAt"> & {
  user: Contact,
  joinedAt: string
}

export interface ChatType<T extends Contact | GroupResponse> {
  chat: T,
  lastMessage: MessageResponse
}

// REACT UTILS

import { createContext } from "react";

export type SelectedChat = {
  group: GroupResponse
} | {
  user: Contact
}

export const SelectedChatContext = createContext<{
  selectedChat: SelectedChat | null,
  setSelectedChat: Dispatch<React.SetStateAction<SelectedChat | null>>
}>({
  selectedChat: null,
  setSelectedChat: () => {}
});