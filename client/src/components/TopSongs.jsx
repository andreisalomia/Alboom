import { useEffect, useState } from "react";
import axios from "axios";
import { getReviews } from "../api/reviews";
import { Link } from "react-router-dom";

export default function TopSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongsWithRatings = async () => {
      setLoading(true);
      const { data: allSongs } = await axios.get("/api/music/songs");
      const songsWithRatings = await Promise.all(
        allSongs.map(async (song) => {
          const { data: reviews } = await getReviews("song", song._id);
          const avg =
            reviews.length > 0
              ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
              : 0;
          return {
            ...song,
            averageRating: avg,
            reviewCount: reviews.length,
          };
        })
      );
      songsWithRatings.sort((a, b) => b.averageRating - a.averageRating);
      setSongs(songsWithRatings.slice(0, 20));
      setLoading(false);
    };

    fetchSongsWithRatings();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Top Songs</h1>
      {loading ? (
        <div style={{ textAlign: "center" }}>Loading...</div>
      ) : songs.length === 0 ? (
        <div style={{ textAlign: "center" }}>No songs found.</div>
      ) : (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          justifyContent: "center"
        }}>
          {songs.map((song, idx) => (
            <Link
              key={song._id}
              to={`/song/${song._id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  padding: "1.5rem",
                  width: 260,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                  transition: "transform 0.15s"
                }}
                onMouseOver={e => e.currentTarget.style.transform = "scale(1.03)"}
                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <span style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  background: "#ffd700",
                  color: "#222",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "1.1rem"
                }}>{idx + 1}</span>
                <h2 style={{ margin: "0.5rem 0 0.3rem 0", fontSize: "1.1rem", textAlign: "center" }}>{song.title}</h2>
                <div style={{ fontSize: "0.98rem", color: "#555", marginBottom: 6 }}>
                  Artist: {song.artist?.name || song.artistName || "Unknown"}
                </div>
                <div style={{ fontSize: "0.95rem", color: "#888", marginBottom: 6 }}>
                  Album: {song.album?.title || "—"}
                </div>
                <div style={{ fontSize: "0.95rem", color: "#888", marginBottom: 6 }}>
                  Genre: {song.genre || "—"}
                </div>
                <div style={{ fontSize: "0.95rem", color: "#888", marginBottom: 6 }}>
                  Duration: {song.duration ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, "0")} min` : "—"}
                </div>
                <div style={{ fontWeight: "bold", color: "#007bff", marginTop: 8 }}>
                  Rating: {song.averageRating ? song.averageRating.toFixed(2) : "N/A"}
                </div>
                <div style={{ color: "#888", fontSize: "0.9rem" }}>
                  {song.reviewCount} review{song.reviewCount === 1 ? "" : "s"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}