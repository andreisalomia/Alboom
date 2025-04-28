// client/src/components/SongDetail.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import CommentSection from "./CommentSection";

export default function SongDetail() {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  let currentUser = null;
  try {
    const token = localStorage.getItem("token");
    if (token) currentUser = jwtDecode(token);
  } catch {}

  useEffect(() => {
    axios.get(`/api/music/songs/${id}`)
      .then(res => setSong(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Se încarcă...</p>;
  if (error || !song) return <p>Piesa nu a putut fi găsită.</p>;

  const formatDur = sec => `${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`;
  const { _id, title, artist, album, genre, duration } = song;

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>{title}</h2>

      {album?.coverImage && (
        <img
          src={album.coverImage}
          alt={`Coperta album ${album.title}`}
          style={{ width: 250, marginBottom: "1rem" }}
        />
      )}

      <p><strong>Artist:</strong> {artist?.name || "—"}</p>
      {album && <p><strong>Album:</strong> {album.title}</p>}
      <p><strong>Gen:</strong> {genre}</p>
      <p><strong>Durată:</strong> {formatDur(duration)}</p>

      <CommentSection
        targetType="song"
        targetId={_id}
        currentUser={currentUser}
      />
    </div>
  );
}
