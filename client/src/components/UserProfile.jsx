// client/src/components/UserProfile.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route, useNavigate, useLocation, useParams } from "react-router-dom";

import "../styles/UserProfile.css";

import ProfileOverview from "./ProfileOverview";
import ProfilePlaylists from "./ProfilePlaylists";
import ProfileFavoriteSongs from "./ProfileFavoriteSongs";
import ProfileSettings from "./ProfileSettings";
import ProfileFriends from "./ProfileFriends";
import ProfileEvents from "./ProfileEvents";
import { useAuth } from "../contexts/AuthContext";
import { ProfileProvider } from "../contexts/ProfileContext";
import ReportReasonModal from "./ReportReasonModal";
import { reportTarget, unreportTarget } from "../api/reports";

export default function UserProfile() {
  const { user: currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [invalidUser, setInvalidUser] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reported, setReported] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const currentPath = location.pathname.split("/").pop();

  const isOwnProfile = userId === currentUser?._id;

  const avatarSrc = isOwnProfile
    ? currentUser.profileImage
    : userData?.profileImage
    ? `/api/users/avatar/${userData.profileImage}`
    : null;

  useEffect(() => {
    if (!currentUser || userId === currentUser._id) {
      setReported(false);
      return;
    }
    const fetchReports = async () => {
      try {
        const res = await axios.get("/api/reports", {
          params: { type: "user", targetId: userId },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setReported(
          Array.isArray(res.data) &&
            res.data.some(
              (r) =>
                r.reporter === currentUser.id ||
                r.reporter === currentUser._id
            )
        );
      } catch {
        setReported(false);
      }
    };
    fetchReports();
  }, [userId, currentUser]);

  useEffect(() => {
    axios
      .get(`/api/users/${userId}`)
      .then(({ data }) => {
        setUserData(data);
        setInvalidUser(false);
      })
      .catch(() => setInvalidUser(true));
  }, [userId]);

  if (invalidUser) {
    return (
      <div>
        <h2>User not found</h2>
        <button onClick={() => navigate("/")}>Go back home</button>
      </div>
    );
  }

  const navigateToSection = (section) => {
    navigate(`/profile/${userId}/${section}`, { replace: true });
  };

  const handleOpenReportModal = () => setReportModalOpen(true);

  const handleSendReport = async (reason) => {
    const url = window.location.pathname;
    await reportTarget("user", userId, url, reason);
    setReportModalOpen(false);
    setReported(true);
  };

  const handleCancelReport = () => setReportModalOpen(false);

  const handleUnreport = async () => {
    await unreportTarget("user", userId);
    setReported(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="profile-info">
          <div className="profile-avatar">
            {avatarSrc ? (
              <img src={avatarSrc} alt="avatar" />
            ) : (
              <div className="avatar-placeholder">
                {userData?.name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          <h2 className="profile-name">{userData?.name || "User Name"}</h2>
          {!isOwnProfile && currentUser && (
            <div style={{ marginTop: "1rem" }}>
              {reported ? (
                <button
                  className="report-btn"
                  style={{
                    background: "#bbb",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "0.4rem 1.2rem",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "1rem",
                  }}
                  onClick={handleUnreport}
                >
                  Remove Report
                </button>
              ) : (
                <button
                  className="report-btn"
                  style={{
                    background: "#dc3545",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "0.4rem 1.2rem",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "1rem",
                  }}
                  onClick={handleOpenReportModal}
                >
                  Report User
                </button>
              )}
            </div>
          )}
        </div>

        <nav className="profile-nav">
          <button
            className={`nav-item ${currentPath === "" ? "active" : ""}`}
            onClick={() => navigateToSection("")}
          >
            Overview
          </button>
          <button
            className={`nav-item ${
              currentPath === "playlists" ? "active" : ""
            }`}
            onClick={() => navigateToSection("playlists")}
          >
            Playlists
          </button>
          <button
            className={`nav-item ${currentPath === "songs" ? "active" : ""}`}
            onClick={() => navigateToSection("songs")}
          >
            Favorite Songs
          </button>
          <button
            className={`nav-item ${currentPath === "friends" ? "active" : ""}`}
            onClick={() => navigateToSection("friends")}
          >
            Friends
          </button>
          {isOwnProfile && (
            <button
              className={`nav-item ${currentPath === 'events' ? 'active' : ''}`}
              onClick={() => navigateToSection('events')}
            >
              Events
            </button>
          )}

          {isOwnProfile && (
            <button
              className={`nav-item at-bottom ${
                currentPath === "settings" ? "active" : ""
              }`}
              onClick={() => navigateToSection("settings")}
            >
              Settings
            </button>
          )}
        </nav>
      </div>

      <div className="profile-content">
        <div style={{ margin: "1.5rem" }}>
          <ProfileProvider value={{ userData, currentUser }}>
            <Routes>
              <Route path="" element={<ProfileOverview />} />
              <Route path="playlists" element={<ProfilePlaylists />} />
              <Route path="songs" element={<ProfileFavoriteSongs />} />
              <Route path="friends" element={<ProfileFriends />} />
              <Route path="events" element={<ProfileEvents />} />
              <Route path="settings" element={<ProfileSettings />} />
              <Route path="*" element={<ProfileOverview />} />
            </Routes>
          </ProfileProvider>
        </div>
      </div>
      <ReportReasonModal
        open={reportModalOpen}
        onSend={handleSendReport}
        onCancel={handleCancelReport}
      />
    </div>
  );
}
