import { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import '../styles/UserProfile.css';
import ProfileOverview from './ProfileOverview';
import ProfilePlaylists from './ProfilePlaylists';
import ProfileFavoriteSongs from './ProfileFavoriteSongs';
import ProfileSettings from './ProfileSettings';

const ProfileContext = createContext(null);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('asta trb sa fie folosita in UserProfile');
  }
  return context;
};

export default function UserProfile({ currentUser }) {
  const [userData, setUserData] = useState(null);
  const [invalidUser, setInvalidUser] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const currentPath = location.pathname.split('/').pop();

  const isOwnProfile = userId === currentUser?.id;

  useEffect(() => {
    const userDataResponse = axios.get(`/api/users/${userId}`);

    userDataResponse
      .then(({ data }) => {
        setUserData(data);
        setInvalidUser(false);
      })
      .catch((error) => {
        setInvalidUser(true);
      });
  }, [userId]);

  const navigateToSection = (section) => {
    navigate(`/profile/${userId}/${section}`, { replace: true });
  };

  if (invalidUser) {
    return (
      <div>
        <h2>User not found</h2>
        <p>The user you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')}>Go back home</button>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="profile-info">
          <div className="profile-avatar">
            {userData?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <h2 className="profile-name">{userData?.name || 'User Name'}</h2>
        </div>
        <nav className="profile-nav">
          <button 
            className={`nav-item ${currentPath === '' ? 'active' : ''}`}
            onClick={() => navigateToSection('')}
          >
            Overview
          </button>
          <button 
            className={`nav-item ${currentPath === 'playlists' ? 'active' : ''}`}
            onClick={() => navigateToSection('playlists')}
          >
            Playlists
          </button>
          <button 
            className={`nav-item ${currentPath === 'songs' ? 'active' : ''}`}
            onClick={() => navigateToSection('songs')}
          >
            Favorite Songs
          </button>
          <button 
            className={`nav-item ${currentPath === 'reviews' ? 'active' : ''}`}
            onClick={() => navigateToSection('reviews')}
          >
            Reviews
          </button>
          {isOwnProfile && (
            <button 
              className={`nav-item at-bottom ${currentPath === 'settings' ? 'active' : ''}`}
              onClick={() => navigateToSection('settings')}
            >
              Settings
            </button>
          )}
        </nav>
      </div>
      <div className="profile-content">
        <div style={{ margin: "1.5rem" }}>
          <ProfileContext.Provider value={{ userData, currentUser }}>
            <Routes>
              <Route path="" element={<ProfileOverview />} />
              <Route path="playlists" element={<ProfilePlaylists />} />
              <Route path="songs" element={<ProfileFavoriteSongs />} />
              <Route path="settings" element={<ProfileSettings />} />
              <Route path="*" element={<ProfileOverview />} />
              { /*TODO: ruta pt reviews */ }
            </Routes>
          </ProfileContext.Provider>
        </div>
      </div>
    </div>
  );
}