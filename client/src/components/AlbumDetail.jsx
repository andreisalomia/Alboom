// client/src/components/AlbumDetail.jsx
import { FaHeart, FaRegHeart } from "react-icons/fa";
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
  const [favoriteIds, setFavoriteIds] = useState([]);

  const [playlists, setPlaylists] = useState([]);
  const [addingSongId, setAddingSongId] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);

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
        //console.log("Album payload:", res.data);
        albumCache[id] = res.data;
        setAlbum(res.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!currentUser) return;
    // favorites
    axios.get("/api/users/me/favorites", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then(res => setFavoriteIds(res.data.map(s => s._id.toString())))
      .catch(console.error);
    // playlists
    axios.get("/api/users/me/playlists", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then(res => setPlaylists(res.data))
      .catch(console.error);
  }, [currentUser]);

   // Toggle favorite for a specific song
  const toggleFavorite = async (songId) => {
    if (!currentUser) return;
    try {
      if (favoriteIds.includes(songId)) {
        await axios.delete(`/api/users/me/favorites/${songId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setFavoriteIds(prev => prev.filter(id => id !== songId));
      } else {
        await axios.post(
          "/api/users/me/favorites",
          { songId },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setFavoriteIds(prev => [...prev, songId]);
      }
    } catch (err) {
      console.error("Favorite toggle failed", err);
    }
  };

    // Add/song to playlist or create new
  const handleAdd = async (songId) => {
    if (creatingNew) {
      // create playlist first
      const res = await axios.post(
        "/api/users/me/playlists",
        { name: newPlaylistName },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const plist = res.data; // new playlist
      setPlaylists(pls => [...pls, plist]);
      await addToPlaylist(songId, plist._id);
      setCreatingNew(false);
      setNewPlaylistName("");
    } else {
      await addToPlaylist(songId, selectedPlaylist);
    }
  };
   // Add song to playlist
  const addToPlaylist = async (songId, playlistId) => {
    try {
      await axios.post(
        `/api/users/me/playlists/${playlistId}/songs`,
        { songId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Piesa a fost adăugată în playlist!");
    } catch (err) {
      console.error(err.response || err);
      alert("Eroare la adăugarea piesei în playlist.");
    } finally {
      setAddingSongId(null);
      setSelectedPlaylist("");
    }
  };

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

  const { _id, title, coverImage, genre, releaseDate, songs, artist } = album;
  const artistName = artist?.name || "--";
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
        textAlign: "left"
      }}>
        {songs.map(song => {
          const sid = song._id.toString();
          const liked = favoriteIds.includes(sid);
          return (
            <li key={sid} style={{ display: "flex", alignItems: "center", margin: "0.5rem 0", justifyContent: "space-between" }}>
              <div style={{ flexGrow: 1 }}>
                {song.title}
                <button style={{ marginLeft: "1rem" }} onClick={() => setAddingSongId(sid)}>
                  + Add to playlist
                </button>
              </div>
              <span onClick={() => toggleFavorite(sid)} style={{ cursor: "pointer", fontSize: "1.2rem", color: liked ? "red" : "lightgray" }}>
                {liked ? <FaHeart /> : <FaRegHeart />}
              </span>
              {addingSongId === sid && (
                <>
                  <select
                    value={selectedPlaylist}
                    onChange={e => {
                      if (e.target.value === "__new") {
                        setCreatingNew(true);
                        setSelectedPlaylist("");
                      } else {
                        setCreatingNew(false);
                        setSelectedPlaylist(e.target.value);
                      }
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    <option value="">Select playlist</option>
                    {playlists.map(pl => <option key={pl._id} value={pl._id}>{pl.name}</option>)}
                    <option value="__new">+ Create new playlist</option>
                  </select>
                  {creatingNew && (
                    <input
                      value={newPlaylistName}
                      onChange={e => setNewPlaylistName(e.target.value)}
                      placeholder="New playlist name"
                      style={{ marginLeft: 8 }}
                    />
                  )}
                  {(selectedPlaylist || creatingNew) && (
                    <button onClick={() => handleAdd(sid)} style={{ marginLeft: 4 }}>
                      {creatingNew ? "Create & Add" : "Add"}
                    </button>
                  )}
                </>
              )}
            </li>
          );
        })}
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
