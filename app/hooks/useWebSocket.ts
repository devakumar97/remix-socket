import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  message: (data: string) => void;
}

interface ClientToServerEvents {
  message: (data: string) => void;
}

export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketIo = io(url, {
      transports: ["websocket"], // ✅ Ensure WebSocket transport
    });

    socketIo.on("connect", () => {
      console.log("✅ Connected to WebSocket server");
      setIsConnected(true);
    });

    socketIo.on("disconnect", () => {
      console.log("❌ Disconnected from WebSocket server");
      setIsConnected(false);
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [url]);

  return { socket, isConnected };
}
