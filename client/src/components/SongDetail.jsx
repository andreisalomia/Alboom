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

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function SongDetail() {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    axios.get(`/api/music/songs/${id}`)
      .then(res => setSong(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Se încarcă...</p>;
  if (error || !song) return <p>Piesa nu a putut fi găsită.</p>;

  // funcţie mică pt. durată MM:SS
  const formatDur = (sec) => `${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`;

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>{song.title}</h2>

      {/* coperta albumului, dacă există */}
      {song.album?.coverImage && (
        <img
          src={song.album.coverImage}
          alt={`Coperta album ${song.album.title}`}
          style={{ width: 250, marginBottom: "1rem" }}
        />
      )}

      <p><strong>Artist:</strong> {song.artist?.name || "—"}</p>
      {song.album && <p><strong>Album:</strong> {song.album.title}</p>}
      <p><strong>Gen:</strong> {song.genre}</p>
      <p><strong>Durată:</strong> {formatDur(song.duration)}</p>
    </div>
  );
}

export default SongDetail;

