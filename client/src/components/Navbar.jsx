import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="navbar-logo">Alboom</Link>
        <Link to="/" className="navbar-link">Home</Link>
      </div>

      <div className="nav-right">
        {user ? (
          <div className="profile-section">
            <Link to={`/profile/${user.id}`} className="profile-icon">
              {user.name.charAt(0).toUpperCase()}
            </Link>
          </div>
        ) : (
          <div className="account-dropdown">
            <button
              className="account-button"
              onClick={() => setMenuOpen(open => !open)}
            >
              Account <span className="hamburger">☰</span>
            </button>

            {menuOpen && (
              <div className="dropdown-menu">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="dropdown-item"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="dropdown-item"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
