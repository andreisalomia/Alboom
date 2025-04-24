import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminModal from './AdminModal';

export default function AddSongModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', genre: '', duration: '', artistId: '', albumId: '', artistName: '' });
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    axios.get('/api/music/artists').then(res => setArtists(res.data));
    axios.get('/api/music/albums').then(res => setAlbums(res.data));
  }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    const { data } = await axios.post('/api/admin/songs', form, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    onCreated(data);
    onClose();
  };

  return (
    <AdminModal title="Add song" onClose={onClose}>
      <form onSubmit={submit}>
        <input name="title" placeholder="Title" onChange={handle} required />
        <input name="genre" placeholder="Genre" onChange={handle} />
        <input name="duration" type="number" placeholder="Duration (s)" onChange={handle} required />
        <select name="artistId" onChange={handle}>
          <option value="">Select artist</option>
          {artists.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
        <input name="artistName" placeholder="Or enter new artist" onChange={handle} />
        <select name="albumId" onChange={handle}>
          <option value="">Select album (optional)</option>
          {albums.map(a => <option key={a._id} value={a._id}>{a.title}</option>)}
        </select>
        <button type="submit">Save</button>
      </form>
    </AdminModal>
  );
}
