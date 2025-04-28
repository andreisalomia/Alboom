import React, { useState } from 'react';
import axios from 'axios';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setMsg('Successfully logged in!');
      onLogin();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Unknown error');
    }
  };

  const handleForgot = async () => {
    if (!forgotEmail) {
      setForgotMsg('Please enter your email.');
      return;
    }
    setForgotLoading(true);
    setForgotMsg('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email: forgotEmail });
      setForgotMsg(res.data.message || 'Password reset email sent.');
    } catch (err) {
      setForgotMsg(err.response?.data?.message || 'Error sending reset email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0' }}>
      <form
        onSubmit={handleLogin}
        style={{
          width: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <h2 style={{ textAlign: 'center', margin: 0 }}>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
        />

        <button
          type="submit"
          style={{ width: '100%', padding: '0.75rem', cursor: 'pointer' }}
        >
          Login
        </button>

        <p style={{ textAlign: 'center', margin: 0, color: '#d00' }}>{msg}</p>

        {!showForgot && (
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              padding: 0,
              textAlign: 'left',
            }}
          >
            Forgot password?
          </button>
        )}
      </form>

      {showForgot && (
        <div
          style={{
            width: '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginTop: '1rem',
          }}
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={forgotEmail}
            onChange={e => setForgotEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />

          <button
            onClick={handleForgot}
            disabled={forgotLoading}
            style={{ width: '100%', padding: '0.75rem', cursor: 'pointer' }}
          >
            {forgotLoading ? 'Sending...' : 'Send reset link'}
          </button>

          <p style={{ textAlign: 'center', margin: 0 }}>{forgotMsg}</p>
        </div>
      )}
    </div>
  );
}
