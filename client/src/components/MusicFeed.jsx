import { useEffect, useState } from 'react';
import axios from 'axios';

export default function MusicFeed() {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      const res = await axios.get('http://localhost:5000/api/music/albums');
      setAlbums(res.data);
    };
    fetchAlbums();
  }, []);

  return (
    <div>
      <h2>Featured Albums</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        {albums.map(album => (
          <div key={album._id} style={{ border: '1px solid #ccc', padding: '1rem', width: 200 }}>
            <img src={album.coverImage} alt={album.title} style={{ width: '100%' }} />
            <h4>{album.title}</h4>
            <p>By: {album.artist?.name}</p>
            <p>Genre: {album.genre}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
