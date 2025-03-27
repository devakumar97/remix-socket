import { useEffect, useState } from "react";
import { useWebSocket } from "~/hooks/useWebSocket";

export default function Chat() {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const { socket, isConnected } = useWebSocket("http://localhost:3000");

  // Listening to messages
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (message: string) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };
    socket.on("message", messageHandler);

    return () => {
      socket.off("message", messageHandler);
    };
  }, [socket]);

  // Sending Messages
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && socket) {
      socket.emit("message", inputMessage);
      setInputMessage("");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
  <h2 className="text-xl font-semibold text-gray-800">Remix Chat</h2>
  <p className={`mt-2 text-sm ${isConnected ? "text-green-600" : "text-red-600"}`}>
    Connection status: {isConnected ? "Connected" : "Disconnected"}
  </p>

  <div className="mt-4 h-60 overflow-y-auto bg-gray-100 p-4 rounded-lg">
    {messages.map((message, index) => (
      <p key={index} className="text-gray-800 bg-white p-2 rounded-lg shadow-sm mb-2">
        {message}
      </p>
    ))}
  </div>

  <form onSubmit={sendMessage} className="mt-4 flex">
    <input
      type="text"
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Type a message..."
    />
    <button
      type="submit"
      className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition">
      Send
    </button>
  </form>
</div>

  );
}
