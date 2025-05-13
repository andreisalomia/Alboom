import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useProfile } from "../contexts/ProfileContext";

export default function ProfileFavoriteSongs() {
  const { currentUser, userData } = useProfile();
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) return;

    const isOwnProfile = currentUser && userData._id === currentUser._id;

    if (isOwnProfile) {
      axios
        .get("/api/users/me/favorites", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then(res => setFavorites(res.data))
        .catch(console.error);
    } else {
      // API populates favoriteSongs on other users' profiles too
      setFavorites(userData.favoriteSongs || []);
    }
  }, [userData, currentUser]);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Favorite Songs</h2>
      {favorites.length === 0 ? (
        <p>Nu există melodii favorite.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {favorites.map(song => (
            <li key={song._id}>
              <Link to={`/song/${song._id}`}>{song.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
