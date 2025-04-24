import { useState } from 'react';
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
    return <p>{msg}</p>;
  }

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      <input placeholder="Name" onChange={e => setName(e.target.value)} required />
      <input placeholder="Email" type="email" onChange={e => setEmail(e.target.value)} required />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Register</button>
      <p>{msg}</p>
    </form>
  );
}
