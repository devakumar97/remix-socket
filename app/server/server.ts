import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { createRequestHandler } from "@remix-run/express";
import express from "express";
import type { ServerBuild } from "@remix-run/node";

// User Socket Mapping
const userSockets = new Map<string, string>(); // userId -> socketId

async function startServer() {
  const buildModule = await import(new URL("../../build/server/index.js", import.meta.url).href);
  const build = buildModule as unknown as ServerBuild;

  const app = express();
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

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

  io.on("connection", (socket: Socket) => {
    console.log("✅ Client Connected:", socket.id);

    socket.on("register", (userId) => {
      userSockets.set(userId, socket.id);
      console.log(`👤 User ${userId} registered with socket ${socket.id}`);
    });

    // Private Messaging
    socket.on("private-message", ({ sender, receiver, message }) => {
      const receiverSocketId = userSockets.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("private-message", { sender, message });
      }
    });

    // Room Handling
    socket.on("join-room", (room) => {
      socket.join(room);
      console.log(`📌 User joined room: ${room}`);
    });

    socket.on("room-message", ({ room, message }) => {
      io.to(room).emit("room-message", { message });
    });

    socket.on("disconnect", () => {
      console.log("❌ Client Disconnected:", socket.id);
      userSockets.forEach((value, key) => {
        if (value === socket.id) userSockets.delete(key);
      });
    });
  });

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

startServer().catch(console.error);
