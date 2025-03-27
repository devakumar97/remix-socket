import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useWebSocket(url: string, userId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketIo = io(url, { transports: ["websocket"] });

    socketIo.on("connect", () => {
      console.log("✅ Connected to WebSocket");
      setIsConnected(true);
      socketIo.emit("register", userId);
    });

    socketIo.on("disconnect", () => {
      console.log("❌ Disconnected from WebSocket");
      setIsConnected(false);
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [url, userId]);

  return { socket, isConnected };
}
