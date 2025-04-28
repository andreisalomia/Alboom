// client/src/components/AlbumDetail.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ReviewSection from "./ReviewSection";
import CommentSection from "./CommentSection";

// simple in-memory cache for albums
const albumCache = {};

export default function AlbumDetail() {
  const { id } = useParams();
  const [album, setAlbum]     = useState(null);
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
    if (albumCache[id]) {
      setAlbum(albumCache[id]);
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(`/api/music/albums/${id}`)
      .then(res => {
        albumCache[id] = res.data;
        setAlbum(res.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Se încarcă detaliile albumului...</div>;
  if (error || !album) return <div>Nu am găsit detalii pentru album.</div>;

  const { _id, title, coverImage, artistName, genre, releaseDate, songs } = album;

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>{title}</h2>

      {/* ★★ Average & interactive review ★★ */}
      <ReviewSection targetType="album" targetId={_id} />

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
      <ol
        style={{
          display: "inline-block",
          listStylePosition: "inside",
          padding: 0,
          margin: "1rem 0",
          textAlign: "center"
        }}
      >
        {songs.map(song => (
          <li key={song._id} style={{ margin: "0.25rem 0" }}>
            {song.title}
          </li>
        ))}
      </ol>

      {/* Comments (left-aligned, write box above) */}
      <CommentSection
        targetType="album"
        targetId={_id}
        currentUser={currentUser}
      />
    </div>
  );
}
