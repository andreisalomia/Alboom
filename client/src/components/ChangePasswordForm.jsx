import { useState } from 'react';
import axios from 'axios';

export default function ChangePasswordForm({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/change-password', { currentPassword, newPassword }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMsg('Password changed successfully.');
      setTimeout(onClose, 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error changing password');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
      <h3>Change Password</h3>
      <input
        type="password"
        placeholder="Current password"
        value={currentPassword}
        onChange={e => setCurrentPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        required
      />
      <button type="submit">Change</button>
      <p>{msg}</p>
      <button type="button" onClick={onClose}>Cancel</button>
    </form>
  );
}
