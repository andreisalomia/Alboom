// // client/src/components/ProfilePlaylists.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useProfile } from "../contexts/ProfileContext";
// import { Link } from "react-router-dom";

// export default function ProfilePlaylists() {
//   const { currentUser, userData } = useProfile();
//   const [playlists, setPlaylists] = useState([]);

//   useEffect(() => {
//     if (!currentUser) return;
//     axios.get("/api/users/me/playlists", {
//       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
//     })
//     .then(res => setPlaylists(res.data))
//     .catch(console.error);
//   }, [currentUser]);

//   if (!playlists) return <p>Loading playlists...</p>;

//   return (
//     <div>
//       <h2>Playlists</h2>
//       {playlists.map(pl => (
//         <div key={pl._id} style={{ marginBottom: "1rem" }}>
//           <h3>{pl.name}</h3>
//           <ul>
//             {pl.songs.map(song => (
//               <li key={song._id}>
//                 <Link to={`/song/${song._id}`}>{song.title}</Link>
//               </li>
//             ))}
//           </ul>
//         </div>
//       ))}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useProfile } from "../contexts/ProfileContext";
import { Link } from "react-router-dom";

export default function ProfilePlaylists() {
  const { currentUser, userData } = useProfile();
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (!userData) return;

    const isOwnProfile = currentUser && userData._id === currentUser._id;

    if (isOwnProfile) {
      // Fetch playlists for the current user
      axios.get("/api/users/me/playlists", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then(res => setPlaylists(res.data))
      .catch(console.error);
    } else {
      // Use playlists from the viewed user's data (API includes only public playlists for other users)
      setPlaylists(userData.playlists || []);
    }

  }, [userData, currentUser]);

  if (!playlists) return <p>Loading playlists...</p>;

  return (
    <div>
      <h2>Playlists</h2>
      {playlists.length === 0 ? (
        <p>No playlists to display.</p>
      ) : (
        playlists.map(pl => (
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
        ))
      )}
    </div>
  );
}
