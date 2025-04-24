import { useState } from 'react';
import axios from 'axios';
import AdminModal from './AdminModal';

export default function AddArtistModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', bio: '', image: '' });
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    const { data } = await axios.post('/api/admin/artists', form, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    onCreated(data);
    onClose();
  };

  return (
    <AdminModal title="Add artist" onClose={onClose}>
      <form onSubmit={submit}>
        <input name="name"  placeholder="Name"  onChange={handle} required />
        <textarea name="bio" placeholder="Bio"   onChange={handle} />
        <input name="image" placeholder="Image URL" onChange={handle} />
        <button type="submit">Save</button>
      </form>
    </AdminModal>
  );
}
