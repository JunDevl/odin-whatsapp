import { io } from "socket.io-client";
import type { Contact, GroupMemberResponse, MessageResponse, SelectedChat, UserResponse } from "./utils";
import type { EntityKind } from "@packages/utils";
import type { Group } from "@types";

export const socket = io(`ws://${import.meta.env["VITE_SERVER_PATH"]}`, {
  withCredentials: true
});

// REST API ACTIONS BELOW

export const createUser = async (formData: FormData) => {
  const data = Object.fromEntries(formData.entries());

  const userResponse = await fetch(`http://${import.meta.env["VITE_SERVER_PATH"]}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!userResponse.ok) throw new Error(await userResponse.text());

  const created = await userResponse.text();

  return created;
}

export const editUserData = async (formData: FormData) => {
  const data = Object.fromEntries(formData.entries());

  const userResponse = await fetch(`http://${import.meta.env["VITE_SERVER_PATH"]}/api/users`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!userResponse.ok) throw new Error(await userResponse.text());

  const edited = await userResponse.text();

  return edited;
}

export const loginUser = async (formData: FormData) => {
  const data = Object.fromEntries(formData.entries());

  const userResponse = await fetch(`http://${import.meta.env["VITE_SERVER_PATH"]}/api/users/auth`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!userResponse.ok) {
    if (userResponse.status === 404 || userResponse.status === 401) return await userResponse.text();
    throw new Error(await userResponse.text());
  }

  return await userResponse.text();
}

export const getLoggedUser = async () => {
  const userResponse = await fetch(`http://${import.meta.env["VITE_SERVER_PATH"]}/api/users`, {
    credentials: "include"
  });

  if (!userResponse.ok) {
    if (userResponse.status === 404 || userResponse.status === 401) return null;
    throw new Error(await userResponse.text());
  }

  const user: UserResponse = await await userResponse.json();

  return user;
}

export const getUserContacts = async () => {
  const fetchedContacts = await fetch(`http://${import.meta.env["VITE_SERVER_PATH"]}/api/users/friends`, {
    credentials: "include"
  });

  if (!fetchedContacts.ok) throw new Error(await fetchedContacts.text());

  const contacts: { friendUser: Contact }[] = await fetchedContacts.json();

  return contacts;
}

export const addContact = async (name: string) => {
  const data = { name };

  const addedContact = await fetch(`http://${import.meta.env["VITE_SERVER_PATH"]}/api/users/friends`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!addedContact.ok) throw new Error(await addedContact.text());

  const added = await addedContact.text();

  return added;
}

export const removeContact = async (name: string) => {
  const removedContact = await fetch(`http://${import.meta.env["VITE_SERVER_PATH"]}/api/users/friends/${name}`, {
    method: "DELETE",
    credentials: "include"
  })

  if (!removedContact.ok) throw new Error(await removedContact.text());

  const removed = await removedContact.text();

  return removed;
}

export const joinGroup = async () => {

}

export const leaveGroup = async () => {

}

export const createGroup = async (name: string, description?: string) => {
  const data = {name, description};

  const createdGroup = await fetch(
    `http://${import.meta.env["VITE_SERVER_PATH"]}/api/groups`, { 
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }
  )

  if (!createdGroup.ok) throw new Error(await createdGroup.text());

  const group = await createdGroup.text();

  return group;
}

export const getUserGroups = async () => {
  const fetchedGroups = await fetch(`http://${import.meta.env["VITE_SERVER_PATH"]}/api/users/groups`, {
    credentials: "include"
  });

  if (!fetchedGroups.ok) throw new Error(await fetchedGroups.text());

  const groups: { group: Group }[] = await fetchedGroups.json();

  return groups;
}

export const getGroupMembers = async (id: string) => {
  const fetchedMembers = await fetch(`http://${import.meta.env["VITE_SERVER_PATH"]}/api/groups/${id}/members`, {
    credentials: "include"
  });

  if (!fetchedMembers.ok) throw new Error(await fetchedMembers.text());

  const members: GroupMemberResponse[] = await fetchedMembers.json();

  return members;
}

export const getMessagesFromChat = async (chatKind: EntityKind, chatIdentification: string) => {
  const result = {
    contact: chatIdentification,
    messages: [] as { message: MessageResponse }[]
  }

  if (chatIdentification === "") return result;

  const messagesResponse = await fetch(
    `http://${import.meta.env["VITE_SERVER_PATH"]}/api/messages/${chatKind}/${chatIdentification}`, 
    { credentials: "include" }
  )

  if (!messagesResponse.ok) throw new Error(await messagesResponse.text());

  result.messages = await messagesResponse.json()

  return result;
}

// WEBSOCKET ACTIONS BELOW

// export const getMessage = async () => {
//   const message = socket.on("userMessage", (content) => content);
// }

export const createMessage = async (content: string, chat: SelectedChat) => {
  const isUser = "user" in chat;

  const kind = isUser ? "user" : "group";

  const reciever = {
    kind, 
    [isUser ? "name" : "id"]: isUser ? chat.user.name : chat.group.id
  } as const;

  let createdMessage: {data: MessageResponse} | {data: null, error: any};

  try {createdMessage = await socket.emitWithAck("createMessage", content, reciever)} 
  catch (e) {throw new Error(e as any)}

  if ("error" in createdMessage) throw new Error(createdMessage.error);

  const {data} = createdMessage;

  return data;
}

export const editMessage = async (id: string, content: string) => {
  let editedMessage: {data: MessageResponse} | {data: null, error: any};

  try {editedMessage = await socket.emitWithAck("editMessage", {id, content})} 
  catch (e) {throw new Error(e as any)}

  if ("error" in editedMessage) throw new Error(editedMessage.error);

  const {data} = editedMessage;

  return data;
}

export const deleteMesssage = async (id: string) => {
  let deletedMessage: {data: MessageResponse} | {data: null, error: any};;

  try {deletedMessage = await socket.emitWithAck("deleteMessage", id)} 
  catch (e) {throw new Error(e as any)}

  if ("error" in deletedMessage) throw new Error(deletedMessage.error);

  const {data} = deletedMessage;

  return data;
}