// client/src/components/ProfileOverview.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useProfile } from "../contexts/ProfileContext";
import "../styles/ProfileOverview.css";
import { useNavigate } from "react-router-dom";

export default function ProfileOverview() {
  const { userData, currentUser } = useProfile();
  const navigate = useNavigate();
  const [friendStatus, setFriendStatus] = useState(null);

  const isOwnProfile = userData?._id === currentUser?.id;

  const loadFriendStatus = useCallback(async () => {
    if (!userData?._id) return;
    try {
      const { data } = await axios.get(
        `/api/users/${userData._id}/friend-status`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setFriendStatus(data.status);
    } catch (err) {
      console.error("Failed to load friend status", err);
    }
  }, [userData?._id]);

  useEffect(() => {
    if (userData && currentUser && !isOwnProfile) {
      loadFriendStatus();
    }
  }, [userData, currentUser, isOwnProfile, loadFriendStatus]);

  if (!userData || !currentUser) {
    return <div>Loading...</div>;
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "role-badge admin";
      case "moderator":
        return "role-badge moderator";
      default:
        return "role-badge user";
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const sendFriendRequest = async () => {
    try {
      await axios.post(
        `/api/users/${userData._id}/friends`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      loadFriendStatus();
    } catch {
      alert("Could not send request");
    }
  };

  const deleteFriendOrRequest = async () => {
    try {
      await axios.delete(`/api/users/${userData._id}/friends`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      loadFriendStatus();
    } catch {
      alert("Could not remove");
    }
  };

  const handleAccept = async (id) => {
    try {
      await axios.post(
        `/api/users/${id}/friends`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      window.location.reload();
    } catch {
      alert("Failed to accept friend request.");
    }
  };

  const handleDecline = async (id) => {
    try {
      await axios.delete(`/api/users/${id}/friends`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      window.location.reload();
    } catch {
      alert("Failed to decline friend request.");
    }
  };

  const avatarSrc = isOwnProfile
    ? currentUser.profileImage
    : userData.profileImage
    ? `/api/users/avatar/${userData.profileImage}`
    : null;

  return (
    <div className="overview-container">
      <div className="overview-header">
        <div className="user-info">
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              overflow: "hidden",
              marginBottom: "1rem",
            }}
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  color: "#444",
                }}
              >
                {userData.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="name-with-badge">
            <h1>{userData.name}</h1>
            <span className={getRoleBadgeClass(userData.role)}>
              {userData.role.replace("authenticated_", "").replace("_", " ")}
            </span>
          </div>
          <p className="join-date">
            Member since {formatDate(userData.createdAt)}
          </p>
        </div>

        {!isOwnProfile && (
          <div className="action-buttons">
            {friendStatus === "friends" && (
              <button className="action-btn friend-btn" onClick={deleteFriendOrRequest}>
                Remove Friend
              </button>
            )}
            {friendStatus === "sent" && (
              <button className="action-btn friend-btn" onClick={deleteFriendOrRequest}>
                Cancel Request
              </button>
            )}
            {friendStatus === "received" && (
              <>
                <button className="action-btn friend-btn" onClick={sendFriendRequest}>
                  Accept
                </button>
                <button className="action-btn friend-btn" onClick={deleteFriendOrRequest}>
                  Decline
                </button>
              </>
            )}
            {friendStatus === "none" && (
              <button className="action-btn friend-btn" onClick={sendFriendRequest}>
                Add Friend
              </button>
            )}
            <button className="action-btn chat-btn" onClick={() => navigate(`/messages/${userData._id}`)}>
              Message
            </button>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-number">{userData.reviews.length}</p>
          <h3>Reviews</h3>
        </div>
        <div className="stat-card">
          <p className="stat-number">{userData.playlists.length}</p>
          <h3>Playlists</h3>
        </div>
        <div className="stat-card">
          <p className="stat-number">{userData.friends.length}</p>
          <h3>Friends</h3>
        </div>
      </div>

      {isOwnProfile && userData.friendRequestsReceived.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Pending Friend Requests</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {userData.friendRequestsReceived.map((u) => (
              <div
                key={u._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  background: "#fafafa",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "#007bff",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: "500" }}>{u.name}</span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => handleAccept(u._id)}
                    style={{
                      padding: "6px 12px",
                      background: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(u._id)}
                    style={{
                      padding: "6px 12px",
                      background: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {userData.favoriteArtists.length > 0 && (
        <div className="favorites-section">
          <h2>Top Artists</h2>
          <div className="favorites-grid">
            {userData.favoriteArtists.map((artist) => (
              <div key={artist._id} className="favorite-item">
                <div className="artist-image-container">
                  <img src={artist.image} alt={artist.name} />
                </div>
                <p>{artist.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
