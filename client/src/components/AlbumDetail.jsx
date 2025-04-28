// client/src/components/AlbumDetail.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import CommentSection from "./CommentSection";

// simple in-memory cache
const albumCache = {};

export default function AlbumDetail() {
  const { id } = useParams();
  const [album, setAlbum]     = useState(null);
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

  // Load album
  useEffect(() => {
    if (!id) return;
    if (albumCache[id]) {
      setAlbum(albumCache[id]);
      setLoading(false);
      return;
    }
    setLoading(true);
    axios.get(`/api/music/albums/${id}`)
      .then(res => {
        albumCache[id] = res.data;
        setAlbum(res.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Load reviews
  const loadReviews = async () => {
    const res = await axios.get("/api/reviews", { params: { targetType: "album", targetId: id } });
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
      { targetType: "album", targetId: id, rating: star },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    loadReviews();
  };

  if (loading) return <div>Se încarcă detaliile albumului...</div>;
  if (error || !album) return <div>Nu am găsit detalii pentru album.</div>;

  const { _id, title, coverImage, artistName, genre, releaseDate, songs } = album;
  const roundedAvg = Math.round(avgRating);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>{title}</h2>

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

      {/* Details */}
      {coverImage && (
        <img
          src={coverImage}
          alt={`Coperta album ${title}`}
          style={{ maxWidth: 300, margin: "1rem 0" }}
        />
      )}
      <p><strong>Artist:</strong> {artistName}</p>
      <p><strong>Gen:</strong> {genre}</p>
      <p><strong>Lansare:</strong> {releaseDate}</p>

      <h3 style={{ marginTop: "2rem" }}>Tracklist:</h3>
      <ol style={{
        display: "inline-block",
        listStylePosition: "inside",
        padding: 0,
        margin: "1rem 0",
        textAlign: "center"
      }}>
        {songs.map(song => (
          <li key={song._id} style={{ margin: "0.25rem 0" }}>
            {song.title}
          </li>
        ))}
      </ol>

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
        targetType="album"
        targetId={_id}
        currentUser={currentUser}
      />
    </div>
  );
}
