
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

// Cache simplu în memorie pentru artiști
const artistCache = {};

function ArtistDetail() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (artistCache[id]) {
      setArtist(artistCache[id]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    axios.get(`/api/music/artists/${id}`)
      .then(response => {
        setArtist(response.data);
        artistCache[id] = response.data;
      })
      .catch(err => {
        console.error("Eroare la preluarea artistului:", err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div>Se încarcă detaliile artistului...</div>;
  }

  if (error || !artist) {
    return <div>Nu am găsit detalii pentru artist.</div>;
  }

  return (
    <div className="artist-detail">
      <h2>{artist.name}</h2>
      {artist.image && <img src={artist.image} alt={`Imagine ${artist.name}`} />}
      <p>{artist.biography}</p>
      <h3>Albume:</h3>
      <ul>
        {artist.albums?.map(album => (
          <li key={album.id}>{album.title}</li>
        ))}
      </ul>
      <h3>Piese:</h3>
      <ul>
        {artist.songs?.map(song => (
          <li key={song.id}>{song.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default ArtistDetail;
