import { io } from "socket.io-client";
import { handleError, PromiseError } from "@packages/utils";
import type { Contact, UserResponse } from "./utils";

const socket = io(`ws://${import.meta.env["VITE_SERVER_PATH"]}`, {
  withCredentials: true
});

socket.on("message", message => console.log(message));

// REST API ACTIONS BELOW

export const createUser = async (formData: FormData) => {
  const data = Object.fromEntries(formData.entries());

  const userResponse = await fetch(`http://${import.meta.env["VITE_SERVER_PATH"]}/api/users`, {
    method: "POST",
    credentials: "include",
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
  const fetchedContacts = await fetch(`http://${import.meta.env["VITE_SERVER_PATH"]}/api/users/friends`);

  if (!fetchedContacts.ok) throw new Error(await fetchedContacts.text());

  const contacts: Contact[] = await fetchedContacts.json();

  return contacts;
}

export const addContact = async (name: string) => {
  const addedContact = await fetch(`http://${import.meta.env["VITE_SERVER_PATH"]}/api/users/friends`, {
    method: "POST",
    body: JSON.stringify({ name })
  })

  if (!addedContact.ok) throw new Error(await addedContact.text());

  const added = await addedContact.text();

  return added;
}

export const removeContact = async (name: string) => {
  const removedContact = await fetch(`http://${import.meta.env["VITE_SERVER_PATH"]}/api/users/friends/${name}`, {
    method: "DELETE"
  })

  if (!removedContact.ok) throw new Error(await removedContact.text());

  const removed = await removedContact.text();

  return removed;
}

// WEBSOCKET ACTIONS BELOW

export const createMessage = async () => {
  
}