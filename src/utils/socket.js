import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  withCredentials: true,
});
console.log("✅ Socket initialized");


