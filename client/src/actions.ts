import { io } from "socket.io-client";
import { handleError, PromiseError } from "@packages/utils";
import type { UserResponse } from "./utils";

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

  const created: UserResponse = await userResponse.json();

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
  const userResponse = await handleError(fetch(`http://${import.meta.env["VITE_SERVER_PATH"]}/api/users`, {
    credentials: "include"
  }));

  if (userResponse instanceof PromiseError) {
    return console.error(`${userResponse.error}\n\n${userResponse.error.stack}`);
  }

  if (!userResponse.ok) {
    if (userResponse.status === 404 || userResponse.status === 401) return null;
    throw new Error(await userResponse.text());
  }

  const user: UserResponse = await await userResponse.json();

  return user;
}

// WEBSOCKET ACTIONS BELOW

export const createMessage = async () => {
  
}

