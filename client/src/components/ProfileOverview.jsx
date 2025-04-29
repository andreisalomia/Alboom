import { useProfile } from '../contexts/ProfileContext';
import '../styles/ProfileOverview.css';

export default function ProfileOverview() {
  const { userData, currentUser } = useProfile();
  const isOwnProfile = userData?._id === currentUser?.id;

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'role-badge admin';
      case 'moderator':
        return 'role-badge moderator';
      default:
        return 'role-badge user';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
			day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="overview-container">
      <div className="overview-header">
        <div className="user-info">
          <div className="name-with-badge">
            <h1>{userData?.name}</h1>
            <span className={getRoleBadgeClass(userData?.role)}>
              {userData?.role?.replace('authenticated_', '').replace('_', ' ')}
            </span>
          </div>
          <p className="join-date">Member since {formatDate(userData?.createdAt)}</p>
        </div>

        {!isOwnProfile && (
          <div className="action-buttons">
            <button className="action-btn friend-btn">
              <i className="fas fa-user-plus"></i>
              Add Friend
            </button>
            <button className="action-btn chat-btn">
              <i className="fas fa-comment-alt"></i>
              Message
            </button>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-number">{userData?.reviews?.length || 0}</p>
          <h3>Reviews</h3>
        </div>
        <div className="stat-card">
          <p className="stat-number">{userData?.playlists?.length || 0}</p>
          <h3>Playlists</h3>
        </div>
        <div className="stat-card">
          <p className="stat-number">{userData?.friends?.length || 0}</p>
          <h3>Friends</h3>
        </div>
      </div>

      {userData?.favoriteArtists?.length > 0 && (
        <div className="favorites-section">
          <h2>Top Artists</h2>
          <div className="favorites-grid">
            {userData?.favoriteArtists.map(artist => (
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