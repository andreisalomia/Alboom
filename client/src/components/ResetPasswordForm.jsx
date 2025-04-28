import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !email) {
      setMsg('Invalid reset link.');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/reset-password', { email, token, newPassword });
      setMsg('Password reset! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error resetting password');
    }
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', padding:'2rem' }}>
      <form onSubmit={handleSubmit} style={{ width:320, display:'flex', flexDirection:'column', gap:12 }}>
        <h2 style={{ textAlign:'center' }}>Reset Password</h2>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          style={{ padding:8 }}
        />
        <button type="submit" style={{ padding:12 }}>Set New Password</button>
        <p style={{ textAlign:'center' }}>{msg}</p>
      </form>
    </div>
  );
}
