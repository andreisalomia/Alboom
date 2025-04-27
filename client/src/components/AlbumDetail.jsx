// import { useParams } from 'react-router-dom';

// export default function AlbumDetail() {
//   const { id } = useParams();
//   return (
//     <div style={{ padding: '2rem' }}>
//       <h2>Album Detail</h2>
//       <p>Album ID: {id}</p>
//     </div>
//   );
// }

// AlbumDetail.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

// Cache simplu în memorie pentru albume
const albumCache = {};

function AlbumDetail() {
  const { id } = useParams();                      // ID-ul albumului din URL
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (albumCache[id]) {
      setAlbum(albumCache[id]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    axios.get(`/api/music/albums/${id}`)
      .then(response => {
        setAlbum(response.data);
        albumCache[id] = response.data;            // stocăm datele în cache
      })
      .catch(err => {
        console.error("Eroare la preluarea albumului:", err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div>Se încarcă detaliile albumului...</div>;
  }

  if (error || !album) {
    return <div>Nu am găsit detalii pentru album.</div>;
  }

  return (
    <div className="album-detail">
      <h2>{album.title}</h2>
      {album.coverImage && <img src={album.coverImage} alt={`Coperta album ${album.title}`} />}
      <p><strong>Artist:</strong> {album.artistName}</p>
      <p><strong>Gen:</strong> {album.genre}</p>
      <p><strong>Lansare:</strong> {album.releaseDate}</p>
      <h3>Tracklist:</h3>
      <ol>
        {album.songs?.map(song => (
          <li key={song.id}>{song.title}</li>
        ))}
      </ol>
    </div>
  );
}

export default AlbumDetail;
