// client/src/components/ProfileSettings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { updateProfile, checkUsername } from '../api/users';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfileSettings.css';

export default function ProfileSettings() {
  const { user, setUser, authLoading } = useAuth();
  const { notify } = useNotifications();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  // Curățăm URL-ul creat pentru preview când se schimbă fișierul
  useEffect(() => {
    if (avatarFile) {
      const objectUrl = URL.createObjectURL(avatarFile);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [avatarFile]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  if (authLoading) return null;
  if (!user) return null;

  const handleBlur = async () => {
    if (name && name !== user.name) {
      try {
        await checkUsername(name);
        setError('');
      } catch (err) {
        if (err.response?.status === 409) {
          setError(`The username "${name}" is already taken.`);
        }
      }
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      const { data: updated } = await updateProfile(formData);
      updated.id = updated._id;
      updated.profileImage = updated.profileImage
        ? `/api/users/avatar/${updated.profileImage}`
        : null;
      setUser(updated);
      notify('Profile updated successfully');
      navigate(`/profile/${updated.id}`, { replace: true });
    } catch (err) {
      if (err.response?.status === 409) {
        setError(`The username "${name}" is already taken. Please choose another.`);
      } else {
        notify('Could not save changes.', { type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">Profile Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="settings-section">
          <h3>Profile Picture</h3>
          <div className="avatar-section">            <div className="avatar-preview">
              {avatarFile ? (
                <img src={URL.createObjectURL(avatarFile)} alt="New avatar preview" />
              ) : user.profileImage ? (
                <img src={user.profileImage} alt="Current avatar" />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div><div className="file-input-wrapper">
                <button
                  type="button"
                  onClick={() => document.getElementById('profile-picture-input').click()}
                  className="edit-button"
                >
                  Change Profile Picture
                </button>
                <input
                  id="profile-picture-input"
                  type="file"
                  accept="image/*"                  onChange={e => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      setAvatarFile(file);
                    } else {
                      notify('Please select an image file.', { type: 'error' });
                    }
                  }}
                  disabled={loading}
                  style={{ display: 'none' }}
                />
              </div>            {avatarFile && (
              <div className="avatar-actions">
                <button
                  type="button"
                  onClick={async () => {
                    const formData = new FormData();
                    formData.append('avatar', avatarFile);
                    setLoading(true);
                    try {
                      const { data: updated } = await updateProfile(formData);
                      updated.id = updated._id;
                      updated.profileImage = updated.profileImage
                        ? `/api/users/avatar/${updated.profileImage}`
                        : null;
                      setUser(updated);
                      notify('Profile picture updated successfully');
                      setAvatarFile(null);
                    } catch (err) {
                      notify('Could not update profile picture.', { type: 'error' });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="action-btn save-btn"
                  disabled={loading}
                >
                  Save Profile Picture
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarFile(null)}
                  className="cancel-button"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="settings-section">
          <h3>Account Information</h3>
          <div className="username-section">
            <div className="current-username">
              <label className="input-label">Username</label>
              <div className="username-display">
                <span>{user.name}</span>
                {!isEditingUsername && (
                  <button
                    type="button"
                    onClick={() => setIsEditingUsername(true)}
                    className="edit-button"
                  >
                    Change Username
                  </button>
                )}
              </div>
            </div>
            
            {isEditingUsername && (              <div className="username-change">
                <div className="input-wrapper">                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onBlur={handleBlur}
                    disabled={loading}
                    className="input-field"
                    placeholder="Enter new username"
                    aria-label="New username"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingUsername(false);
                      setName(user.name);
                      setError('');
                    }}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>                {error && <p className="error-message">{error}</p>}
                {name !== user.name && !error && (
                  <button
                    type="button"
                    onClick={async () => {
                      setError('');
                      setLoading(true);
                      const formData = new FormData();
                      formData.append('name', name);
                      try {
                        const { data: updated } = await updateProfile(formData);
                        updated.id = updated._id;
                        updated.profileImage = updated.profileImage
                          ? `/api/users/avatar/${updated.profileImage}`
                          : null;
                        setUser(updated);
                        notify('Username updated successfully');
                        setIsEditingUsername(false);
                      } catch (err) {
                        if (err.response?.status === 409) {
                          setError(`The username "${name}" is already taken. Please choose another.`);
                        } else {
                          notify('Could not update username.', { type: 'error' });
                        }
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="action-btn save-btn"
                    disabled={loading}
                  >
                    Save Username
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
