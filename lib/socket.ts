import { io } from "socket.io-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
// The user specified http://localhost:3000/location in their example, 
// but our API_BASE defaults to 3001. I'll use 3001 to be consistent with the rest of the app,
// or use the user's specific URL if it's strictly required.
// Given the prompt details, I'll use the API_BASE as the foundation.

const socketUrl = API_BASE.replace(/\/$/, "");

export const socket = io(`${socketUrl}/location`, {
    autoConnect: false,
});
