// frontend/app/hooks/useSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_WS_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3001");

// prettier-ignore
export function useSocket(roomCode: string, userId: string, playerName: string,) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !roomCode || !playerName?.trim()) return;

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected");
      setIsConnected(true);
      setError(null);

      newSocket.emit("join-room", { code: roomCode, userId, playerName });
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket error:", err);
      setIsConnected(false);
      setError(err.message);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [roomCode, userId, playerName]);

  return { socket, isConnected, error };
}
