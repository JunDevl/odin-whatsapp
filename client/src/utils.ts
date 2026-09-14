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

export type UserGroups = {group: GroupResponse}[];

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

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

// REACT UTILS

import { createContext } from "react";

export type SelectedChatID = {
  id: string // If it's a group
} | {
  name: string // If it's a contact
}

export const SelectedChatContext = createContext<{
  selectedChatID: SelectedChatID | null,
  setSelectedChatID: Dispatch<React.SetStateAction<SelectedChatID | null>>
}>({
  selectedChatID: null,
  setSelectedChatID: () => {}
});

export const ContactsContext = createContext<UserContacts | null>(null);

export const GroupsContext = createContext<UserGroups | null>(null);

