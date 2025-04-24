import { useEffect, useState } from "react";
import axios from "axios";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Link } from "react-router-dom";

export default function MusicFeed({ refreshTrigger }) {
    const [albums, setAlbums] = useState([]);
    const [artists, setArtists] = useState([]);
    const [songs, setSongs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const [albumsRes, artistsRes, songsRes] = await Promise.all([
                axios.get("/api/music/albums"),
                axios.get("/api/music/artists"),
                axios.get("/api/music/songs"),
            ]);
            setAlbums(albumsRes.data);
            setArtists(artistsRes.data);
            setSongs(songsRes.data);
        };

        fetchData();
    }, [refreshTrigger]);

    // 👇 Random picker
    const pickRandom = (list, count) =>
        list.sort(() => 0.5 - Math.random()).slice(0, count);

    const topSongs = pickRandom(songs, 10);
    const topArtists = pickRandom(artists, 3);
    const topAlbums = pickRandom(albums, 3);

    return (
        <div>
            {/* 🎧 Top 10 Songs */}
            <h2>🎧 Top 10 Songs</h2>
            <div style={styles.container}>
                {topSongs.map((song) => (
                    <Link
                        to={`/song/${song._id}`}
                        key={song._id}
                        style={styles.link}
                    >
                        <div style={styles.card}>
                            <h4>{song.title}</h4>
                            <p>Artist: {song.artist?.name}</p>
                            <p>Album: {song.album?.title || "Single"}</p>
                            <p>
                                Duration: {Math.floor(song.duration / 60)}:
                                {String(song.duration % 60).padStart(2, "0")}{" "}
                                min
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* 🌟 Weekly Artists */}
            <h2 style={{ marginTop: "2rem" }}>🌟 Weekly Artists</h2>
            <div style={styles.container}>
                {topArtists.map((artist) => (
                    <Link
                        to={`/artist/${artist._id}`}
                        key={artist._id}
                        style={styles.link}
                    >
                        <div style={styles.card}>
                            <LazyLoadImage
                                src={artist.image}
                                alt={artist.name}
                                effect="blur"
                                width="100%"
                            />
                            <h4>{artist.name}</h4>
                            <p>{artist.bio?.substring(0, 60)}...</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* 🆕 Recent Albums */}
            <h2 style={{ marginTop: "2rem" }}>🆕 Recent Albums</h2>
            <div style={styles.container}>
                {topAlbums.map((album) => (
                    <Link
                        to={`/album/${album._id}`}
                        key={album._id}
                        style={styles.link}
                    >
                        <div style={styles.card}>
                            <LazyLoadImage
                                src={album.coverImage}
                                alt={album.title}
                                effect="blur"
                                width="100%"
                            />
                            <h4>{album.title}</h4>
                            <p>By: {album.artist?.name}</p>
                            <p>Genre: {album.genre}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

// 💄 Stiluri inline simple
const styles = {
    container: {
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        justifyContent: "center",
    },
    card: {
        border: "1px solid #ccc",
        padding: "1rem",
        width: 200,
        textAlign: "left",
    },
    link: {
        textDecoration: "none",
        color: "inherit",
    },
};
