// client/src/contexts/SocketContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socketReady, setSocketReady] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io();
    console.log("Socket.IO initialized");

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
    });

    socketRef.current.on("disconnect", () => {
      console.warn("Socket disconnected");
    });

    // Global handler
    socketRef.current.on("receive_message", (msg) => {
      // console.log("GLOBAL SOCKET MESSAGE:", msg);
      // Dispatch custom event to notify other components (optional)
      window.dispatchEvent(new CustomEvent("socket:receive_message", { detail: msg }));
    });

    setSocketReady(true);

    return () => {
      socketRef.current?.disconnect();
      console.log("Socket.IO disconnected");
    };
  }, []);

  useEffect(() => {
    if (user?.id && socketRef.current && socketReady) {
      socketRef.current.emit("register", user.id);
      console.log("Registered socket for user:", user.id);
    }
  }, [user, socketReady]);

  return (
    <SocketContext.Provider value={socketReady ? socketRef.current : null}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
