import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  return (
    <div>
      {/* Navbar */}
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

      {/* Overlay + Slide Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Fundal întunecat simplu */}
            <motion.div
              className="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Side Menu */}
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
              </div>

              <div className="menu-links">
                <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link to="/topsongs" onClick={() => setMenuOpen(false)}>Top Songs</Link>
                <Link to="/artists" onClick={() => setMenuOpen(false)}>Artists</Link>

                {!user ? (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
                  </>
                ) : (
                  <>
                    <Link to={`/profile/${user.id}`} onClick={() => setMenuOpen(false)}>Profile</Link>
                    <Link to="/messages" onClick={() => setMenuOpen(false)}>Messages</Link>
                    <button onClick={() => { setMenuOpen(false); logout() }} className="logout-button">
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
