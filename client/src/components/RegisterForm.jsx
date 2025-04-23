import { useState } from 'react';
import axios from 'axios';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      setMsg(`Created account with ID: ${res.data.userId}`);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Unknown error');
    }
  };

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
