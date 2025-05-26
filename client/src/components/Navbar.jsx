// client/src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/Navbar.css";
import { useNotifications } from "../contexts/NotificationContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { notifications } = useNotifications();

  useEffect(() => {
    const primeAudio = () => {
      const audio = new Audio("/notification.mp3");
      audio.play().catch(() => {});
      document.removeEventListener("click", primeAudio);
    };
    document.addEventListener("click", primeAudio);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  // use user.id if present, otherwise fall back to user._id
  const userId = user?.id ?? user?._id;

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">Alboom</Link>
        </div>
        <div className="navbar-right">
          <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger-button">
            <Menu size={32} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMenuOpen(false)}
            />

            <motion.div
              className="side-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="menu-header">
                <button onClick={() => setMenuOpen(false)} className="close-button">
                  <X size={32} />
                </button>
              </div>              <div className="menu-links">
                <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link to="/topsongs" onClick={() => setMenuOpen(false)}>Top Songs</Link>
                <Link to="/artists" onClick={() => setMenuOpen(false)}>Artists</Link>
                <Link to="/threads" onClick={() => setMenuOpen(false)}>Threads</Link>

                {!user ? (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
                  </>
                ) : (
                  <>
                    <Link
                      to={`/profile/${userId}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/messages"
                      onClick={() => setMenuOpen(false)}
                      style={{ position: "relative" }}
                    >
                      Messages
                      {notifications.length > 0 && (
                        <span style={{
                          position: "absolute",
                          top: -5,
                          right: -10,
                          background: "red",
                          color: "white",
                          borderRadius: "50%",
                          padding: "2px 6px",
                          fontSize: "0.75rem"
                        }}>
                          {notifications.length}
                        </span>
                      )}
                    </Link>
                    {(user.role === "admin" || user.role === "moderator") && (
                      <Link
                        to="/reports"
                        onClick={() => setMenuOpen(false)}
                      >
                        Reports
                      </Link>
                    )}
                    <button
                      onClick={() => { setMenuOpen(false); logout(); }}
                      className="logout-button"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
