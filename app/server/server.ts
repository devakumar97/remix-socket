import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { createRequestHandler } from "@remix-run/express";
import express from "express";
import type { ServerBuild } from "@remix-run/node";

// Define WebSocket event types
interface ServerToClientEvents {
  message: (data: string) => void;
}

interface ClientToServerEvents {
  message: (data: string) => void;
}

async function startServer() {
    const buildModule = await import(new URL("../../build/server/index.js", import.meta.url).href);
    const build = buildModule as unknown as ServerBuild;

  const app = express();
  const httpServer = createServer(app);

  // WebSocket server with CORS config
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  // Set up Remix request handler
  app.all(
    "*",
    createRequestHandler({
      build,
      mode: process.env.NODE_ENV,
      getLoadContext() {
        return { io }; 
      },
    })
  );

  // WebSocket connection handler
  io.on("connection", (socket: Socket<ServerToClientEvents, ClientToServerEvents>) => {
    console.log("✅ Client Connected");

    socket.on("message", (data) => {
      console.log("📩 Received message:", data);
      io.emit("message", data); 
    });

    socket.on("disconnect", () => {
      console.log("❌ Client Disconnected");
    });
  });

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

startServer().catch(console.error); 
