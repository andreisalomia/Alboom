import React, { useState } from 'react';
import axios from 'axios';

export default function RegisterForm({ onRegistered }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      setMsg(res.data.message || 'Account created. Check your email.');
      setSuccess(true);
      onRegistered(email);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Unknown error');
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
        <p style={{
          width: '320px',
          textAlign: 'center',
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {msg}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
      <form
        onSubmit={handleRegister}
        style={{
          width: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <h2 style={{ textAlign: 'center', margin: 0 }}>Register</h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
        />

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
          Register
        </button>

        <p style={{ textAlign: 'center', margin: 0 }}>{msg}</p>
      </form>
    </div>
  );
}
