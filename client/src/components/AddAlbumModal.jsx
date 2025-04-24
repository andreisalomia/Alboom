import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminModal from './AdminModal';

export default function AddAlbumModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    genre: '',
    releaseDate: '',
    coverImage: '',
    artistId: '',
    artistName: ''
  });

  const [artists, setArtists] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/music/artists')
      .then(res => setArtists(res.data))
      .catch(() => setArtists([]));
  }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/admin/albums', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onCreated(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add album');
    }
  };

  return (
    <AdminModal title="Add album" onClose={onClose}>
      <form onSubmit={submit}>
        <input name="title" placeholder="Title" onChange={handle} required />
        <input name="genre" placeholder="Genre" onChange={handle} />
        <input name="releaseDate" type="date" onChange={handle} />
        <input name="coverImage" placeholder="Cover URL" onChange={handle} />
        <label>Select existing artist:</label>
        <select name="artistId" onChange={handle}>
          <option value="">— None —</option>
          {artists.map(a => (
            <option key={a._id} value={a._id}>{a.name}</option>
          ))}
        </select>
        <label>Or enter new artist:</label>
        <input name="artistName" placeholder="Artist name" onChange={handle} />
        <button type="submit">Save</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </AdminModal>
  );
}
