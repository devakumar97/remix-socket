import { useEffect, useState } from "react";
import { useWebSocket } from "~/hooks/useWebSocket";
import { users } from "~/utils/users";

export default function Chat() {
  const userId = "user1"; // Simulated Logged-in User
  const { socket, isConnected } = useWebSocket("http://localhost:3000", userId);
  
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [recipient, setRecipient] = useState<string | null>(null);
  const [room, setRoom] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("private-message", ({ sender, message }) => {
      setMessages((prev) => [...prev, `📩 ${sender}: ${message}`]);
    });

    socket.on("room-message", ({ message }) => {
      setMessages((prev) => [...prev, `🏠 Room: ${message}`]);
    });

    return () => {
      socket.off("private-message");
      socket.off("room-message");
    };
  }, [socket]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !inputMessage.trim()) return;

    if (recipient) {
      socket.emit("private-message", { sender: userId, receiver: recipient, message: inputMessage });
    } else if (room) {
      socket.emit("room-message", { room, message: inputMessage });
    }

    setInputMessage("");
  };

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit("join-room", roomId);
      setRoom(roomId);
      setRecipient(null);
    }
  };

  return (
    <div>
      <h2>Real-Time Chat</h2>
      <p>Connection: {isConnected ? "🟢 Online" : "🔴 Offline"}</p>

      <div>
        <h3>Select a User (DM)</h3>
        {users.map((user) => (
          <button key={user.id} onClick={() => { setRecipient(user.id); setRoom(null); }}>
            {user.name}
          </button>
        ))}
      </div>

      <div>
        <h3>Join a Room</h3>
        {["room1", "room2"].map((roomId) => (
          <button key={roomId} onClick={() => joinRoom(roomId)}>
            {roomId}
          </button>
        ))}
      </div>

      <div>
        <h3>Messages</h3>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>

      <form onSubmit={sendMessage}>
        <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
