import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import CommentSection from "./CommentSection";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function SongDetail() {
  const { id } = useParams();
  const [song, setSong]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Current user
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) setCurrentUser(jwtDecode(token));
    } catch {}
  }, []);

  // Load song + status favorite
  useEffect(() => {
    setLoading(true);
    axios.get(`/api/music/songs/${id}`)
      .then(res => {
        setSong(res.data);
        // dacă backend-ul returnează `isFavorited`
        setIsFavorited(!!res.data.isFavorited);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

   // 2️⃣ La fiecare mount sau când currentUser/id se schimbă,
 // trage lista de favorite și setează isFavorited
  useEffect(() => {
    if (!currentUser) return;
    axios.get("/api/users/me/favorites", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => {
      // res.data = [{ _id, title, artist }, ...]
      const favIds = res.data.map(s => s._id);
      setIsFavorited(favIds.includes(id));
    })
    .catch(err => console.error("Could not load favorites:", err));
  }, [currentUser, id]);
  // toggle favorite
  const toggleFavorite = async () => {
    if (!currentUser) return; // sau redirecționează la login
    try {
      if (isFavorited) {
        await axios.delete(`/api/users/me/favorites/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
      } else {
        await axios.post(`/api/users/me/favorites`,
          { songId: id },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      }
      setIsFavorited(!isFavorited);
    } catch (err) {
      console.error("Favorite toggle failed", err);
    }
  };

  // … tot ce ține de reviews/ratings rămâne la fel
  // Load reviews & compute ratings
  const [reviews, setReviews]     = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
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
    <div style={{ position: "relative", textAlign: "center", padding: "2rem" }}>
      {/* ❤️ / 🤍 Inimioara toggle */}
      <div
        onClick={toggleFavorite}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          cursor: "pointer",
          fontSize: "1.8rem",
          color: isFavorited ? "red" : "lightgray"
        }}
        aria-label={isFavorited ? "Înlătură din favorite" : "Adaugă la favorite"}
      >
        {isFavorited ? <FaHeart /> : <FaRegHeart />}
      </div>

      <h2>{title}</h2>

      {/* 📊 Average Rating */}
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

      {/* 🌟 Your Rating */}
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
  );
}


