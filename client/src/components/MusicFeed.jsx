import { useEffect, useState } from 'react';
import axios from 'axios';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

export default function MusicFeed() {
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [albumsRes, artistsRes, songsRes] = await Promise.all([
        axios.get('/api/music/albums'),
        axios.get('/api/music/artists'),
        axios.get('/api/music/songs')
      ]);
      setAlbums(albumsRes.data);
      setArtists(artistsRes.data);
      setSongs(songsRes.data);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>Featured Albums</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        {albums.map(album => (
          <div key={album._id} style={{ border: '1px solid #ccc', padding: '1rem', width: 200 }}>
            <LazyLoadImage
              src={album.coverImage}
              alt={album.title}
              effect="blur"
              width="100%"
            />
            <h4>{album.title}</h4>
            <p>By: {album.artist?.name}</p>
            <p>Genre: {album.genre}</p>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: '2rem' }}>Featured Artists</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        {artists.map(artist => (
          <div key={artist._id} style={{ border: '1px solid #ccc', padding: '1rem', width: 200 }}>
            <LazyLoadImage
              src={artist.image}
              alt={artist.name}
              effect="blur"
              width="100%"
            />
            <h4>{artist.name}</h4>
            <p>{artist.bio?.substring(0, 60)}...</p>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: '2rem' }}>Featured Songs</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        {songs.map(song => (
          <div key={song._id} style={{ border: '1px solid #ccc', padding: '1rem', width: 200 }}>
            <h4>{song.title}</h4>
            <p>Artist: {song.artist?.name}</p>
            <p>Album: {song.album?.title || 'Single'}</p>
            <p>Genre: {song.genre}</p>
            <p>Duration: {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')} min</p>
          </div>
        ))}
      </div>
    </div>
  );
}
