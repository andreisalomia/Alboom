// SearchBar.jsx
import { useState, useEffect } from "react";
import axios from "axios";

function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    // Funcție pentru a obține sugestii de la API
    const fetchSuggestions = async (searchTerm) => {
      try {
        const response = await axios.get(`/api/music/search?query=${searchTerm}`);
        setSuggestions(response.data);    // presupunem că response.data este o listă de sugestii
      } catch (err) {
        console.error("Eroare la căutare:", err);
        setSuggestions([]);               // în caz de eroare, resetăm sugestiile
      }
    };

    // Dacă nu există text, golim lista de sugestii și nu facem cerere
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }

    // Debounce: așteptăm 300ms înainte de a face cererea, resetând timer-ul anterior
    if (timeoutId) clearTimeout(timeoutId);
    const newTimeoutId = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
    setTimeoutId(newTimeoutId);

    // Curățăm timeout la demontare sau la schimbarea query
    return () => clearTimeout(newTimeoutId);
  }, [query]);

  // Gestionăm modificarea textului din input
  const onChangeQuery = (e) => {
    setQuery(e.target.value);
  };

  // (Opțional) Gestionăm clic pe o sugestie – de exemplu, navigare către pagina relevantă
  const onSelectSuggestion = (suggestion) => {
    // logica de navigare la ArtistDetail/AlbumDetail/SongDetail pe baza tipului sugestiei
    // exemplu: navigate(`/${suggestion.type}/${suggestion.id}`)
    console.log("Suggestion selected:", suggestion);
    setQuery("");           // resetăm query după selecție
    setSuggestions([]);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Căutare melodii, albume, artiști..."
        value={query}
        onChange={onChangeQuery}
      />
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map(item => (
            <li
              key={`${item.type}-${item.id}`}
              onClick={() => onSelectSuggestion(item)}
            >
              {/* Afișăm sugestia cu contextul ei (artist/album/piesă) */}
              {item.type === "artist" && <span>🎤 {item.name}</span>}
              {item.type === "album" && <span>💿 {item.title} – {item.artistName}</span>}
              {item.type === "song" && <span>🎵 {item.title} – {item.artistName}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
