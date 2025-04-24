import { useState } from 'react';
import MusicFeed from './MusicFeed';
import AddArtistModal from './AddArtistModal';
import AddAlbumModal from './AddAlbumModal';
import AddSongModal from './AddSongModal';

export default function Dashboard({ user, onLogout }) {
  const [modal, setModal] = useState(null); // 'song' | 'album' | 'artist' | null

  const closeModal = () => setModal(null);

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <p>Your role: {user.role}</p>

      {user.role === 'authenticated_user' && (
        <p>You are logged in as a regular user.</p>
      )}
      {user.role === 'moderator' && (
        <p>You are a moderator and can manage content.</p>
      )}
      {user.role === 'admin' && (
        <>
          <p>You are an admin and can add new content.</p>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => setModal('song')}>Add Song</button>
            <button onClick={() => setModal('album')} style={{ marginLeft: '1rem' }}>Add Album</button>
            <button onClick={() => setModal('artist')} style={{ marginLeft: '1rem' }}>Add Artist</button>
          </div>
        </>
      )}

      <button onClick={onLogout} style={{ marginTop: '2rem' }}>Logout</button>

      <MusicFeed />

      {modal === 'artist' && <AddArtistModal onClose={closeModal} onCreated={() => { /* refresh feed if needed */ }} />}
      {modal === 'album'  && <AddAlbumModal  onClose={closeModal} onCreated={() => { /* refresh feed if needed */ }} />}
      {modal === 'song'   && <AddSongModal   onClose={closeModal} onCreated={() => { /* refresh feed if needed */ }} />}
    </div>
  );
}
