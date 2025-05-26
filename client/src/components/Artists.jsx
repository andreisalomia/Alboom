import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/music/artists")
      .then(res => setArtists(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Artists</h1>
      {loading ? (
        <div style={{ textAlign: "center" }}>Loading...</div>
      ) : artists.length === 0 ? (
        <div style={{ textAlign: "center" }}>No artists found.</div>
      ) : (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          justifyContent: "center"
        }}>
          {artists.map(artist => (
            <Link
              key={artist._id}
              to={`/artist/${artist._id}`}
              style={{
                textDecoration: "none",
                color: "inherit"
              }}
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
                  transition: "transform 0.15s",
                }}
                onMouseOver={e => e.currentTarget.style.transform = "scale(1.03)"}
                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <img
                  src={artist.image || "https://via.placeholder.com/120?text=Artist"}
                  alt={artist.name}
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: "50%",
                    marginBottom: "1rem",
                    border: "2px solid #eee"
                  }}
                />
                <h2 style={{ margin: "0.5rem 0 0.3rem 0", fontSize: "1.2rem" }}>{artist.name}</h2>
                <p style={{ fontSize: "0.95rem", color: "#555", textAlign: "center" }}>
                  {artist.bio || <span style={{ color: "#aaa" }}>No bio available.</span>}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}