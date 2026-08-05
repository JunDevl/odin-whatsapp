import { io } from "socket.io-client";

const socket = io(`ws://${import.meta.env["VITE_SERVER_PATH"]}`);