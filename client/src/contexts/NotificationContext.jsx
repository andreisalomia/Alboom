import { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const NotificationContext = createContext();
const socket = io("http://localhost:5000");

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user?.id) {
      socket.emit("register", user.id);

      const handleMessage = (msg) => {
        if (msg.sender !== user.id) {
          setNotifications((prev) => [...prev, msg]);

          const audio = new Audio("/notification.mp3");
          audio.play().catch(() => {});

          toast.info(`New message from ${msg.senderName || "someone"}`, {
            icon: "💬"
          });
        }
      };

      socket.on("receive_message", handleMessage);
      return () => socket.off("receive_message", handleMessage);
    }
  }, [user?.id]);

  const clearNotifications = () => setNotifications([]);
  const notify = (message, options) => toast(message, options);

  return (
    <NotificationContext.Provider value={{ notifications, clearNotifications, notify }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
