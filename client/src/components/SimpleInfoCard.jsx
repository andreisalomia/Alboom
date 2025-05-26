import { Link } from "react-router-dom";

export default function SimpleInfoCard({ to, image, title, subtitle, description, extra }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        color: "inherit",
        width: 300,
        margin: "0.5rem",
        display: "block"
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #fff 70%, #f0f4ff 100%)",
          borderRadius: 18,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          padding: "1.5rem 1.2rem",
          minHeight: 180,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          transition: "transform 0.15s",
          gap: "0.6rem"
        }}
        onMouseOver={e => e.currentTarget.style.transform = "scale(1.04)"}
        onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {image && (
          <img
            src={image}
            alt={title}
            style={{
              width: 150,
              height: 150,
              objectFit: "cover",
              borderRadius: 14,
              marginBottom: 14,
              background: "#eee"
            }}
          />
        )}
        <div style={{ fontWeight: 600, fontSize: "1.15rem", marginBottom: 2, textAlign: "center" }}>{title}</div>
        {subtitle && <div style={{ fontSize: "1rem", color: "#555", textAlign: "center" }}>{subtitle}</div>}
        {description && <div style={{ fontSize: "0.97rem", color: "#888", textAlign: "center" }}>{description}</div>}
        {extra}
      </div>
    </Link>
  );
}