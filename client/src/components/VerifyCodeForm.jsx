import { useState } from 'react';
import axios from 'axios';

export default function VerifyCodeForm({ email, onVerified }) {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/verify', { email, code });
      setMsg(res.data.message);
      onVerified();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <form onSubmit={handleVerify}>
      <h3>Verify Your Account</h3>
      <p>We've sent a 6-digit code to <strong>{email}</strong></p>
      <input
        type="text"
        placeholder="Enter verification code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />
      <button type="submit">Verify</button>
      <p>{msg}</p>
    </form>
  );
}
