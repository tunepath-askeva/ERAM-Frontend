import { io } from "socket.io-client";

const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://tradelivetoday.com";

export const socket = io(baseUrl, {
  withCredentials: true,
});
console.log("✅ Socket initialized");


