// client/src/components/SongDetail.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import CommentSection from "./CommentSection";

export default function SongDetail() {
  const { id } = useParams();
  const [song, setSong]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  // Reviews state
  const [reviews, setReviews]     = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [userRating, setUserRating] = useState(0);

  // Current user
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) setCurrentUser(jwtDecode(token));
    } catch {}
  }, []);

  // Load song
  useEffect(() => {
    axios.get(`/api/music/songs/${id}`)
      .then(res => setSong(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Load reviews & compute ratings
  const loadReviews = async () => {
    const res = await axios.get("/api/reviews", { params: { targetType: "song", targetId: id } });
    const data = res.data;
    setReviews(data);
    const sum = data.reduce((a, r) => a + r.rating, 0);
    const avg = data.length ? sum / data.length : 0;
    setAvgRating(avg);
    if (currentUser) {
      const mine = data.find(r => r.author._id === currentUser.id);
      setUserRating(mine ? mine.rating : 0);
    }
  };
  useEffect(() => { loadReviews(); }, [id, currentUser]);

  const handleRating = async (star) => {
    if (!currentUser) return;
    await axios.post("/api/reviews",
      { targetType: "song", targetId: id, rating: star },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    loadReviews();
  };

  if (loading) return <p>Se încarcă...</p>;
  if (error || !song) return <p>Piesa nu a putut fi găsită.</p>;

  const formatDur = sec => `${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`;
  const { _id, title, artist, album, genre, duration } = song;
  const roundedAvg = Math.round(avgRating);

  return (
    <div className="page-content">
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>{title}</h2>

      {/* 📊 Average Rating (read-only, blue stars) */}
      <div><strong>Average rating:</strong> {avgRating.toFixed(1)} / 5</div>
      <div style={{ margin: "0.25rem 0" }}>
        {[1,2,3,4,5].map(i => (
          <span key={i} style={{
            fontSize: "1.5rem",
            color: i <= roundedAvg ? "blue" : "lightgray",
            margin: "0 3px"
          }}>★</span>
        ))}
      </div>

      {/* 🎨 Song Details */}
      {album?.coverImage && (
        <img
          src={album.coverImage}
          alt={`Coperta album ${album.title}`}
          style={{ width: 250, margin: "1rem 0" }}
        />
      )}
      <p><strong>Artist:</strong> {artist?.name || "—"}</p>
      {album && <p><strong>Album:</strong> {album.title}</p>}
      <p><strong>Gen:</strong> {genre}</p>
      <p><strong>Duration:</strong> {formatDur(duration)}</p>

      {/* 🌟 Your Rating (interactive, gold stars) */}
      <div style={{ margin: "1rem 0" }}>
        {[1,2,3,4,5].map(i => (
          <span
            key={i}
            onClick={() => handleRating(i)}
            style={{
              cursor: currentUser ? "pointer" : "default",
              fontSize: "1.5rem",
              color: i <= userRating ? "gold" : "lightgray",
              margin: "0 3px"
            }}
          >★</span>
        ))}
      </div>

      {/* 💬 Comments */}
      <CommentSection
        targetType="song"
        targetId={_id}
        currentUser={currentUser}
      />
    </div>
    </div>
  );
}
