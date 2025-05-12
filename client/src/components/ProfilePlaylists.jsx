// client/src/components/ProfilePlaylists.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useProfile } from "../contexts/ProfileContext";
import { Link } from "react-router-dom";

export default function ProfilePlaylists() {
  const { currentUser, userData } = useProfile();
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    axios.get("/api/users/me/playlists", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => setPlaylists(res.data))
    .catch(console.error);
  }, [currentUser]);

  if (!playlists) return <p>Loading playlists...</p>;

  return (
    <div>
      <h2>Playlists</h2>
      {playlists.map(pl => (
        <div key={pl._id} style={{ marginBottom: "1rem" }}>
          <h3>{pl.name}</h3>
          <ul>
            {pl.songs.map(song => (
              <li key={song._id}>
                <Link to={`/song/${song._id}`}>{song.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
