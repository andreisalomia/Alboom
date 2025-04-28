import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/Navbar.css";

export default function Navbar({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  return (
    <div>
      {/* NAVBAR FIX */}
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">Alboom</Link>
        </div>
        <div className="navbar-right">
          <button onClick={() => setMenuOpen(true)} className="hamburger-button">
            <Menu size={32} />
          </button>
        </div>
      </nav>

      {/* SLIDE MENU */}
      <AnimatePresence>
        {menuOpen && (
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
                  <button onClick={() => setMenuOpen(false)} className="logout-button">
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
