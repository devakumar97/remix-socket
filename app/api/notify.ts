import { ActionFunctionArgs } from "@remix-run/node";
import type { Server as SocketIOServer } from "socket.io";

interface CustomContext {
  io: SocketIOServer;
}

export async function action({ request, context }: ActionFunctionArgs & { context: CustomContext }) {
  const formData = await request.formData();
  const message = formData.get("message");

  if (!message || typeof message !== "string") {
    return { success: false, error: "Invalid message" };
  }

  // Access the Socket.IO instance from the context
  const { io } = context;
  io.emit("message", message); // ✅ Use "message" event to match frontend

  return { success: true };
}
