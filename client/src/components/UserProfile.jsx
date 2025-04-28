import { Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import '../styles/UserProfile.css';
import ProfileOverview from './ProfileOverview';
import ProfilePlaylists from './ProfilePlaylists';
import ProfileLikedSongs from './ProfileLikedSongs';
import ProfileSettings from './ProfileSettings';

export default function UserProfile({ currentUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const currentPath = location.pathname.split('/').pop();

  const navigateToSection = (section) => {
    navigate(`/profile/${userId}/${section}`, { replace: true });
  };

  return (
    <div className='page-content'>
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="profile-info">
          <div className="profile-avatar">
						{/* TODO: sa fie dupa userId, nu dupa currentUser */}
            {currentUser?.name.charAt(0).toUpperCase() || 'A'}
          </div>
          <h2 className="profile-name">{currentUser?.name || 'User Name'}</h2>
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
            Liked Songs
          </button>
					{userId === currentUser?.id && (
						<button 
							className={`nav-item at-bottom ${currentPath === 'settings' ? 'active' : ''}`}
							onClick={() => navigateToSection('settings')}
						>
							Settings
						</button>
					)}
        </nav>
      </div>
      </div>
      <div className="profile-content">
				<div style={{ margin: "1.5rem" }}>
					<Routes>
						<Route path="" element={<ProfileOverview />} />
						<Route path="playlists" element={<ProfilePlaylists />} />
						<Route path="songs" element={<ProfileLikedSongs />} />
						<Route path="settings" element={<ProfileSettings />} />
						<Route path="*" element={<ProfileOverview />} />
					</Routes>
				</div>
      </div>
    </div>
  );
}