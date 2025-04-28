// client/src/components/ArtistDetail.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ReviewSection from "./ReviewSection";
import CommentSection from "./CommentSection";

// simple in-memory cache for artists
const artistCache = {};

export default function ArtistDetail() {
  const { id } = useParams();
  const [artist, setArtist]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  // decode current user from JWT (if any)
  let currentUser = null;
  try {
    const token = localStorage.getItem("token");
    if (token) currentUser = jwtDecode(token);
  } catch {}

  useEffect(() => {
    if (!id) return;
    if (artistCache[id]) {
      setArtist(artistCache[id]);
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(`/api/music/artists/${id}`)
      .then(res => {
        artistCache[id] = res.data;
        setArtist(res.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Se încarcă detaliile artistului...</div>;
  if (error || !artist) return <div>Nu am găsit detalii pentru artist.</div>;

  const { _id, name, image, biography, albums, songs } = artist;

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>{name}</h2>

      {/* ★★ Average & interactive review ★★ */}
      <ReviewSection targetType="artist" targetId={_id} />

      {image && (
        <img
          src={image}
          alt={`Imagine ${name}`}
          style={{ maxWidth: 300, margin: "1rem 0" }}
        />
      )}
      <p style={{ maxWidth: 600, margin: "0.5rem auto" }}>{biography}</p>

      <h3 style={{ marginTop: "2rem" }}>Albume:</h3>
      <ul
        style={{
          display: "inline-block",
          listStylePosition: "inside",
          padding: 0,
          margin: "1rem 0",
          textAlign: "center"
        }}
      >
        {albums.map(a => (
          <li key={a.id} style={{ margin: "0.25rem 0" }}>
            {a.title}
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: "2rem" }}>Piese:</h3>
      <ul
        style={{
          display: "inline-block",
          listStylePosition: "inside",
          padding: 0,
          margin: "1rem 0",
          textAlign: "center"
        }}
      >
        {songs.map(s => (
          <li key={s.id} style={{ margin: "0.25rem 0" }}>
            {s.title}
          </li>
        ))}
      </ul>

      {/* Comments (left-aligned, write box above) */}
      <CommentSection
        targetType="artist"
        targetId={_id}
        currentUser={currentUser}
      />
    </div>
  );
}
