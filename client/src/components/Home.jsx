import { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import MusicFeed from "./MusicFeed";
import SearchBar from "./SearchBar";
import ChangePasswordForm from "./ChangePasswordForm";

export default function HomePage({ user, onLogin, onLogout }) {
  const [refreshFeed, setRefreshFeed] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    setShowChangePassword(false);
  }, [user]);

  const triggerRefresh = () => {
    setRefreshFeed(prev => !prev);
  };

  return (
    <div style={{ textAlign: "center", paddingTop: "1rem" }}>
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
          <button onClick={onLogout}>Logout</button>
          <button onClick={() => setShowChangePassword(true)}>
            Change Password
          </button>
          {showChangePassword && (
            <ChangePasswordForm onClose={() => setShowChangePassword(false)} />
          )}
        </div>
      )}

      {user?.role === "admin" && (
        <Dashboard
          user={user}
          onLogout={onLogout}
          onRefresh={triggerRefresh}
        />
      )}

      <div style={{ marginTop: "3rem" }}>
        <MusicFeed refreshTrigger={refreshFeed} />
      </div>
    </div>
  );
}
