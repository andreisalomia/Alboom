// import { useParams } from 'react-router-dom';

// export default function SongDetail() {
//   const { id } = useParams();
//   return (
//     <div style={{ padding: '2rem' }}>
//       <h2>Song Detail</h2>
//       <p>Song ID: {id}</p>
//     </div>
//   );
// }

// SongDetail.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

// Cache simplu în memorie pentru piese (melodii)
const songCache = {};

function SongDetail() {
  const { id } = useParams();                      // ID-ul piesei din URL
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (songCache[id]) {
      setSong(songCache[id]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    axios.get(`/api/music/songs/${id}`)
      .then(response => {
        setSong(response.data);
        songCache[id] = response.data;             // memorăm în cache
      })
      .catch(err => {
        console.error("Eroare la preluarea piesei:", err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div>Se încarcă detaliile piesei...</div>;
  }

  if (error || !song) {
    return <div>Nu am găsit detalii pentru piesă.</div>;
  }

  return (
    <div className="song-detail">
      <h2>{song.title}</h2>
      <p><strong>Artist:</strong> {song.artistName}</p>
      {song.albumTitle && (
        <p><strong>Album:</strong> {song.albumTitle}</p>
      )}
      <p><strong>Gen:</strong> {song.genre}</p>
      <p><strong>Durată:</strong> {song.duration}</p>
    </div>
  );
}

export default SongDetail;
