import { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

export default function MessagesPage() {
  const { user } = useAuth();
  const { userId: selectedUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      socket.emit("register", user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    const handleMessage = (msg) => {
      if (
        msg.sender === selectedUserId ||
        msg.recipient === selectedUserId
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receive_message", handleMessage);
    return () => socket.off("receive_message", handleMessage);
  }, [selectedUserId]);

  useEffect(() => {
    if (!selectedUserId) return;
    axios
      .get(`/api/messages/${selectedUserId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setMessages(res.data))
      .catch(() => alert("Could not load messages"));
  }, [selectedUserId]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    try {
      const { data } = await axios.post(
        "/api/messages",
        {
          recipientId: selectedUserId,
          content: newMsg,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      socket.emit("send_message", data);
      setMessages((prev) => [...prev, data]);
      setNewMsg("");
    } catch {
      alert("Failed to send message");
    }
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "2rem auto",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        height: "75vh",
      }}
    >
      <div
        ref={chatRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          borderBottom: "1px solid #ddd",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.sender === user.id ? "right" : "left",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                display: "inline-block",
                background:
                  m.sender === user.id ? "#007bff" : "#e9ecef",
                color: m.sender === user.id ? "white" : "black",
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                maxWidth: "70%",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: "0.5rem", borderRadius: 4 }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 4,
            background: "#007bff",
            color: "white",
            border: "none",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
