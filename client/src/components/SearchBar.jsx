import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [focused, setFocused] = useState(false);
  const timer = useRef(null);
  const navigate = useNavigate();

  // fetch cu debounce
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    if (!query.trim()) { setResults([]); return; }

    timer.current = setTimeout(async () => {
      try {
        const { data } = await axios.get(`/api/music/search`, { params: { q: query } });
        setResults(data);
      } catch (err) {
        console.error(err);
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer.current);
  }, [query]);

  // navigare la click
  const goTo = (item) => {
    navigate(`/${item.type}/${item.id}`);
    setQuery("");
    setResults([]);
  };

  return (
    <div style={styles.box}>
      <input
        style={styles.input}
        value={query}
        placeholder="Caută artiști, albume, piese..."
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)} // lăsăm timp pentru click
      />

      {focused && results.length > 0 && (
        <ul style={styles.list}>
          {results.map(r => (
            <li key={`${r.type}-${r.id}`} style={styles.item} onClick={() => goTo(r)}>
              {r.image && <img src={r.image} alt="" style={styles.avatar} />}
              <div>
                <strong>{r.text}</strong>
                {r.sub && <span style={styles.sub}> – {r.sub}</span>}
                <span style={styles.badge}>{r.type}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// stiluri inline minime
const styles = {
  box:   { position: "relative", maxWidth: 400, margin: "0 auto" },
  input: { width: "100%", padding: "8px 12px", fontSize: 16 },
  list:  { listStyle: "none", margin: 0, padding: 0,
           position: "absolute", top: "100%", left: 0, right: 0,
           background: "#fff", border: "1px solid #ccc", maxHeight: 300,
           overflowY: "auto", zIndex: 5 },
  item:  { padding: "6px 10px", display: "flex", alignItems: "center",
           gap: 10, cursor: "pointer" },
  avatar:{ width: 32, height: 32, objectFit: "cover", borderRadius: 4 },
  sub:   { color: "#555", fontSize: 12 },
  badge: { background: "#eee", borderRadius: 4, fontSize: 10, padding: "2px 4px",
           marginLeft: 6, textTransform: "uppercase" }
};
