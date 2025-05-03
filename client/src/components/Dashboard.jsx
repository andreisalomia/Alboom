// Dashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import AddArtistModal from "./AddArtistModal";
import AddAlbumModal from "./AddAlbumModal";
import AddSongModal from "./AddSongModal";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard({ onRefresh }) {
  const [modal, setModal] = useState(null); // 'song' | 'album' | 'artist'
  const [deleteModal, setDeleteModal] = useState(null); // same values
  const { user } = useAuth();

  const closeModal = () => setModal(null);
  const closeDeleteModal = () => setDeleteModal(null);

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <p>Your role: {user.role}</p>

      {user.role === "admin" && (
        <>
          <p>You are an admin and can add or remove content.</p>
          <div style={{ marginTop: "1rem" }}>
            <button onClick={() => setModal("song")}>Add Song</button>
            <button onClick={() => setModal("album")} style={{ marginLeft: "1rem" }}>
              Add Album
            </button>
            <button onClick={() => setModal("artist")} style={{ marginLeft: "1rem" }}>
              Add Artist
            </button>
          </div>

          <div style={{ marginTop: "2rem" }}>
            <button onClick={() => setDeleteModal("song")}>Delete Song</button>
            <button onClick={() => setDeleteModal("album")} style={{ marginLeft: "1rem" }}>
              Delete Album
            </button>
            <button onClick={() => setDeleteModal("artist")} style={{ marginLeft: "1rem" }}>
              Delete Artist
            </button>
          </div>
        </>
      )}

      {modal === "artist" && (
        <AddArtistModal
          onClose={closeModal}
          onCreated={() => {
            closeModal();
            onRefresh();
          }}
        />
      )}
      {modal === "album" && (
        <AddAlbumModal
          onClose={closeModal}
          onCreated={() => {
            closeModal();
            onRefresh();
          }}
        />
      )}
      {modal === "song" && (
        <AddSongModal
          onClose={closeModal}
          onCreated={() => {
            closeModal();
            onRefresh();
          }}
        />
      )}

      {deleteModal && (
        <DeleteEntityModal type={deleteModal} onClose={closeDeleteModal} onDeleted={onRefresh} />
      )}
    </div>
  );
}

function DeleteEntityModal({ type, onClose, onDeleted }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return setResults([]);

    const delay = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/music/${type}s`);
        const list = res.data.filter((item) => {
          const text = item.name || item.title;
          return text.toLowerCase().includes(query.toLowerCase());
        });
        setResults(list);
      } catch (err) {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query, type]);

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await axios.delete(`/api/admin/${type}s/${selected._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      onDeleted();
      onClose();
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Delete a {type}</h3>
        <input
          type="text"
          placeholder={`Search ${type}s...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />
        <ul style={styles.resultList}>
          {results.map((r) => (
            <li
              key={r._id}
              onClick={() => setSelected(r)}
              style={r._id === selected?._id ? styles.activeItem : styles.item}
            >
              {r.title || r.name}
            </li>
          ))}
        </ul>
        {selected && (
          <div style={{ marginTop: "1rem" }}>
            <p>Confirm delete of: <strong>{selected.title || selected.name}</strong>?</p>
            <button onClick={confirmDelete} style={{ marginRight: "1rem" }}>Yes, Delete</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        )}
        {!selected && (
          <div style={{ marginTop: "1rem" }}>
            <button onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white', padding: '1.5rem', borderRadius: '8px', width: '400px', maxHeight: '80vh', overflowY: 'auto'
  },
  resultList: {
    margin: '1rem 0', padding: 0, listStyle: 'none', maxHeight: '200px', overflowY: 'auto'
  },
  item: {
    padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #eee'
  },
  activeItem: {
    padding: '0.5rem', cursor: 'pointer', backgroundColor: '#def', borderBottom: '1px solid #ccc'
  }
};
