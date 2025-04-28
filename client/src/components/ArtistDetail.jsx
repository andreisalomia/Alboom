// client/src/components/ArtistDetail.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import CommentSection from "./CommentSection";

// simple in-memory cache for artists
const artistCache = {};

export default function ArtistDetail() {
  const { id } = useParams();
  const [artist, setArtist]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  // Reviews
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

  // Load artist
  useEffect(() => {
    if (!id) return;
    if (artistCache[id]) {
      setArtist(artistCache[id]);
      setLoading(false);
      return;
    }
    setLoading(true);
    axios.get(`/api/music/artists/${id}`)
      .then(res => {
        artistCache[id] = res.data;
        setArtist(res.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Load reviews
  const loadReviews = async () => {
    const res = await axios.get("/api/reviews", { params: { targetType: "artist", targetId: id } });
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
      { targetType: "artist", targetId: id, rating: star },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    loadReviews();
  };

  if (loading) return <div>Se încarcă detaliile artistului...</div>;
  if (error || !artist) return <div>Nu am găsit detalii pentru artist.</div>;

  const { _id, name, image, biography, albums, songs } = artist;
  const roundedAvg = Math.round(avgRating);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>{name}</h2>

      {/* Average */}
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

      {image && (
        <img
          src={image}
          alt={`Imagine ${name}`}
          style={{ maxWidth: 300, margin: "1rem 0" }}
        />
      )}
      <p style={{ maxWidth: 600, margin: "0.5rem auto" }}>{biography}</p>

      <h3 style={{ marginTop: "2rem" }}>Albume:</h3>
      <ul style={{
        display: "inline-block",
        listStylePosition: "inside",
        padding: 0,
        margin: "1rem 0",
        textAlign: "center"
      }}>
        {albums.map(a => (
          <li key={a.id} style={{ margin: "0.25rem 0" }}>{a.title}</li>
        ))}
      </ul>

      <h3 style={{ marginTop: "2rem" }}>Piese:</h3>
      <ul style={{
        display: "inline-block",
        listStylePosition: "inside",
        padding: 0,
        margin: "1rem 0",
        textAlign: "center"
      }}>
        {songs.map(s => (
          <li key={s.id} style={{ margin: "0.25rem 0" }}>{s.title}</li>
        ))}
      </ul>

      {/* Your rating */}
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

      {/* Comments */}
      <CommentSection
        targetType="artist"
        targetId={_id}
        currentUser={currentUser}
      />
    </div>
  );
}
