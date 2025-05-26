import { useState, useEffect } from "react";
import { useAuth } from '../contexts/AuthContext';
import Dashboard from "./Dashboard";
import MusicFeed from "./MusicFeed";
import SearchBar from "./SearchBar";
import ChangePasswordForm from "./ChangePasswordForm";

export default function HomePage() {
  const [refreshFeed, setRefreshFeed] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { user, login, logout } = useAuth();

  useEffect(() => {
    setShowChangePassword(false);
  }, [user]);

  const triggerRefresh = () => {
    setRefreshFeed(prev => !prev);
  };

  const baseButtonStyle = {
    padding: '0.5rem 1.2rem',
    margin: '0 0.5rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: 'white',
  };

  const logoutStyle = {
    ...baseButtonStyle,
    backgroundColor: '#dc3545',
  };

  const changePwStyle = {
    ...baseButtonStyle,
    backgroundColor: '#007bff',
  };

  return (
    <div style={{ textAlign: "center", paddingTop: "1rem", paddingBottom: "1rem" }}>
      <h1>Welcome to Alboom</h1>
      <SearchBar />

      {!user && (
        <p style={{ margin: "1rem 0" }}>
          To login or register, click the <strong>Account</strong> menu at top-right.
        </p>
      )}

      {user && (
        <div style={{ margin: "1rem 0" }}>
          <p>Logged in as {user.name} ({user.role})</p>
          <div>
            <button style={logoutStyle} onClick={logout}>
              Logout
            </button>
            <button style={changePwStyle} onClick={() => setShowChangePassword(true)}>
              Change Password
            </button>
          </div>
          {showChangePassword && (
            <ChangePasswordForm onClose={() => setShowChangePassword(false)} />
          )}
        </div>
      )}

      {user?.role === "admin" && (
        <Dashboard onRefresh={triggerRefresh}/>
      )}

      <div style={{ marginTop: "3rem" }}>
        <MusicFeed refreshTrigger={refreshFeed} />
      </div>
    </div>
  );
}
