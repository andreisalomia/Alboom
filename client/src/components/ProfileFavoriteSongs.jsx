// export default function ProfileFavoriteSongs() {
//     return (
//         <div>
//             melodii
//         </div>
//     )
// }

// client/src/components/ProfileFavoriteSongs.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ProfileFavoriteSongs() {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/users/me/favorites", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => {
      // res.data poate fi array de song objects { _id, title, artist: { name } }
      setFavorites(res.data);
    })
    .catch(console.error);
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Favorite Songs</h2>
      {favorites.length === 0 ? (
        <p>Nu ai melodii favorite.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {favorites.map(song => (
            <li
              key={song._id}
              style={{ margin: "0.5rem 0", cursor: "pointer" }}
              onClick={() => navigate(`/track/${song._id}`)}
            >
              {song.title} — {song.artist.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
