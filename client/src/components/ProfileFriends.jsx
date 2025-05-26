import { Link } from "react-router-dom";
import { useProfile } from "../contexts/ProfileContext";

export default function ProfileFriends() {
  const { userData } = useProfile();

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>{userData?.name}'s Friends</h2>

      {userData?.friends?.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "1rem"
          }}
        >
          {userData.friends.map(friend => (
            <Link
              to={`/profile/${friend._id}`}
              key={friend._id}
              style={{
                background: "#f9f9f9",
                borderRadius: "8px",
                padding: "1rem",
                textAlign: "center",
                textDecoration: "none",
                color: "#111",
                transition: "box-shadow 0.2s ease",
                boxShadow: "0 0 0 rgba(0,0,0,0)",
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 0 rgba(0,0,0,0)")}
            >
              {/* Profile image or first letter of the name */}
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  margin: "0 auto 0.5rem",
                  borderRadius: "50%",
                  background: friend.profileImage 
                    ? `url(/api/users/avatar/${friend.profileImage})`  // Show profile image if available
                    : '#007bff',  // Fallback to blue if no profile image
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: friend.profileImage ? 'transparent' : '#fff',  // Hide text if image exists
                  fontWeight: "bold",
                  fontSize: "1.4rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {/* Show first letter of the name if there's no profile image */}
                {!friend.profileImage && friend.name?.charAt(0).toUpperCase()}
              </div>
              <p style={{ margin: 0, fontWeight: 500 }}>{friend.name}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ fontStyle: "italic", color: "#666" }}>
          This user has no friends yet.
        </p>
      )}
    </div>
  );
}