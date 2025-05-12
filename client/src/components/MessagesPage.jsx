import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { useSocket } from "../contexts/SocketContext";

export default function MessagesPage() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [partnerName, setPartnerName] = useState("Loading...");
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  // Socket registration
  useEffect(() => {
    if (user?.id && socket) {
      // console.log("Registering user on socket:", user.id);
      socket.emit("register", user.id);
    }
  }, [user, socket]);

  // Get partner name
  useEffect(() => {
    axios
      .get(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setPartnerName(res.data.name))
      .catch(() => setPartnerName("Unknown"));
  }, [userId]);

  // Get conversation history
  useEffect(() => {
    if (!user) return;
    axios
      .get(`/api/messages/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setMessages(res.data))
      .catch(() => alert("Failed to load messages"));
  }, [userId, user]);

  // Socket listener for incoming messages
  useEffect(() => {
    if (!user) return;
  
    const handler = (e) => {
      const msg = e.detail;
      // console.log("[MessagesPage] Received message:", msg);
  
      const inCurrentChat =
        (String(msg.sender) === userId && String(msg.recipient) === user.id) ||
        (String(msg.sender) === user.id && String(msg.recipient) === userId);
  
      if (inCurrentChat) {
        // console.log("Message is for this chat. Appending to UI.");
        setMessages((prev) => [...prev, msg]);
      } else {
        console.log("Message is NOT for this chat.");
      }
    };
  
    window.addEventListener("socket:receive_message", handler);
    return () => window.removeEventListener("socket:receive_message", handler);
  }, [user, userId]);
  

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    axios
      .post(
        "/api/messages",
        { recipientId: userId, content: newMessage },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res) => {
        const msg = {
          ...res.data,
          sender: res.data.sender._id || user.id,
        };

        // console.log("Sending message via socket:", msg);
        setMessages((prev) => [...prev, msg]);
        socket.emit("send_message", msg);
        setNewMessage("");
      })
      .catch(() => alert("Failed to send message"));
  };

  // Debug info
  useEffect(() => {
    if (!user || !partnerName || messages.length === 0) return;

    // console.log("Conversation Debug Info:");
    // console.log("Current User:", { id: user.id, name: user.name });
    // console.log("Talking To:", { id: userId, name: partnerName });
    // console.log("Total Messages:", messages.length);
    // console.log("Last Message:", messages[messages.length - 1]);
  }, [user, partnerName, messages]);

  if (!user || !socket) {
    return <div style={{ textAlign: "center", marginTop: "2rem" }}>Loading chat...</div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Chat with {partnerName}
      </h2>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          borderRadius: "8px",
          height: "400px",
          overflowY: "auto",
          marginBottom: "1rem",
        }}
      >
        {messages.map((msg) => {
          const isMine = String(msg.sender) === String(user.id);
          return (
            <div
              key={msg._id}
              style={{
                textAlign: isMine ? "right" : "left",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  borderRadius: "1rem",
                  backgroundColor: isMine ? "#d1e7dd" : "#f8d7da",
                  maxWidth: "75%",
                  wordBreak: "break-word",
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            background: "#007bff",
            color: "#fff",
            border: "none",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
