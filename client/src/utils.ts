// TYPESCRIPT UTILS
import type { Status } from "@packages/utils";
import type { UseSuspenseQueryResult } from "@tanstack/react-query";
import type { User, Group, MemberOfGroup, Message } from "@types";
import type { Dispatch } from "react";

export type LoggedUserResponse = Omit<User, "id" | "password_hash">;

export type MessageResponse = Omit<Message, "sentAt" | "editedAt" | "deletedAt" | "senderId"> & { 
  sender: { name: string },
  sentAt: string,
  editedAt: string | null,
  deletedAt: string | null
}

export type Contact = Omit<User, "id" | "email" | "password_hash">;

export type GroupResponse = Omit<Group, "createdAt"> & {createdAt: string};

export type UserContacts = {friendUser: Contact; status: Status}[];

export type UserGroups = {group: Group}[];

export type GroupMemberResponse = Omit<MemberOfGroup, "userId" | "joinedAt"> & {
  user: Contact,
  joinedAt: string
}

export type ChatType<T> = T extends Contact ? {
  chat: Contact,
  status: "online" | "offline"
  lastMessage: MessageResponse
} : {
  chat: GroupResponse,
  lastMessage: MessageResponse
}

// REACT UTILS

import { createContext } from "react";

export type SelectedChat = {
  group: GroupResponse
} | {
  user: Contact
  status: "online" | "offline"
}

export const SelectedChatContext = createContext<{
  selectedChat: SelectedChat | null,
  setSelectedChat: Dispatch<React.SetStateAction<SelectedChat | null>>
}>({
  selectedChat: null,
  setSelectedChat: () => {}
});

export const ContactsContext = createContext<UserContacts | null>(null);

export const GroupsContext = createContext<UserGroups | null>(null);

