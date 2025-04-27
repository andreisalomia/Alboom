import { Link } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar({ user }) {
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
            <Link to="/" className="login-button">Login</Link>
          )}
        </div>
      </nav>
    );
}