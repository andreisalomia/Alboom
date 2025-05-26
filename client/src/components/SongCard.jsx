import { Link } from "react-router-dom";

export default function SimpleSongCard({ song }) {
  return (
    <Link
      to={`/song/${song._id}`}
      style={{
        textDecoration: "none",
        color: "inherit",
        width: 240,
        margin: "0.5rem",
        display: "block"
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #fff 70%, #f0f4ff 100%)",
          borderRadius: 16,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          padding: "1.3rem 1.1rem",
          minHeight: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          position: "relative",
          transition: "transform 0.15s",
          gap: "0.3rem"
        }}
        onMouseOver={e => e.currentTarget.style.transform = "scale(1.04)"}
        onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <div style={{ fontWeight: 600, fontSize: "1.08rem", marginBottom: 2 }}>{song.title}</div>
        <div style={{ fontSize: "0.97rem", color: "#555" }}>
          {song.artist?.name || "Unknown"}
        </div>
        <div style={{ fontSize: "0.93rem", color: "#888" }}>
          {song.album?.title || "Single"}
        </div>
        <div style={{ fontSize: "0.93rem", color: "#888" }}>
          {song.duration ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, "0")} min` : "—"}
        </div>
      </div>
    </Link>
  );
}