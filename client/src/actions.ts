import { io } from "socket.io-client";
import { handleError, PromiseError } from "@packages/utils";
import type { ChatKind, Contact, MessageResponse, UserResponse } from "./utils";

export const socket = io(`ws://${import.meta.env["VITE_SERVER_PATH"]}`, {
  withCredentials: true
});

socket.on("message", message => console.log(message));

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

  const contacts: Contact[] = await fetchedContacts.json();

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

export const getMessagesFromChat = async (chatKind: ChatKind, chatIdentification: string) => {
  const result = {
    contact: chatIdentification,
    messages: [] as MessageResponse[]
  }

  if (chatIdentification === "") return result;

  const chatRoute = chatKind === "conversation" ? "user" : "group";

  const messagesResponse = await fetch(
    `http://${import.meta.env["VITE_SERVER_PATH"]}/api/messages/${chatRoute}/${chatIdentification}`, 
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

export const createMessage = async (content: string, chat: {name: string, kind: ChatKind}) => {
  const kind = chat.kind === "conversation" ? "user" : chat.kind;

  const reciever = {kind, name: chat.name} as const;

  let createdMessage: MessageResponse;

  try {createdMessage = await socket.emitWithAck("userMessage", content, reciever)} 
  catch (e) {throw new Error(e as any)}

  return createdMessage;
}