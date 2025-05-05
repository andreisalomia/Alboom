import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";

export default function MessagesOverview() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    axios
      .get("/api/messages/conversations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setConversations(res.data))
      .catch(() => alert("Failed to load conversations"));
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "2rem", textAlign: "center" }}>
        Your Conversations
      </h2>

      {conversations.length === 0 ? (
        <p style={{ textAlign: "center" }}>No conversations found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {conversations.map((c) => (
            <li
              key={c._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
                background: "#f9f9f9",
                transition: "box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 10px rgba(0,0,0,0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = "0 0 0 rgba(0,0,0,0)")
              }
            >
              <Link
                to={`/messages/${c._id}`}
                style={{
                  textDecoration: "none",
                  color: "#111",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3 style={{ marginBottom: "0.3rem" }}>{c.name}</h3>
                  <p style={{ color: "#555", margin: 0 }}>
                    {c.lastMessage?.slice(0, 60) || "No messages yet..."}
                  </p>
                </div>
                <div style={{ color: "#aaa", fontSize: "0.8rem" }}>
                  {c.lastTime && new Date(c.lastTime).toLocaleString()}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
