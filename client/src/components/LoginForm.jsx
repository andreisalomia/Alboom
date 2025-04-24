import { useState } from 'react';
import axios from 'axios';
// import { login } from '../api/auth';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

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

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input placeholder="Email" type="email" onChange={e => setEmail(e.target.value)} required />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Login</button>
      <p>{msg}</p>
    </form>
  );
}
