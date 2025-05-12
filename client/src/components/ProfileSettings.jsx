// client/src/components/ProfileSettings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { updateProfile, checkUsername } from '../api/users';
import { useNavigate } from 'react-router-dom';

export default function ProfileSettings() {
  const { user, setUser, authLoading } = useAuth();
  const { notify } = useNotifications();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
          setError(`The username “${name}” is already taken.`);
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
        setError(`The username “${name}” is already taken. Please choose another.`);
      } else {
        notify('Could not save changes.', { type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-6">
      <div>
        <label className="block mb-2">Current Avatar</label>
        {user.profileImage ? (
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden' }}>
            <img
              src={user.profileImage}
              alt="avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e2e8f0' }} />
        )}
      </div>

      <div>
        <label className="block mb-2">Change Avatar</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setAvatarFile(e.target.files[0])}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block mb-2">Username</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={handleBlur}
          disabled={loading}
          className="w-full border rounded p-2"
        />
        {error && <p className="text-red-600 mt-1">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={loading || Boolean(error)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}
