import { useEffect, useState } from "react";
import axios from "axios";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Link } from "react-router-dom";
import SimpleSongCard from "./SongCard";
import SimpleInfoCard from "./SimpleInfoCard";

export default function MusicFeed({ refreshTrigger }) {
    const [albums, setAlbums] = useState([]);
    const [artists, setArtists] = useState([]);
    const [songs, setSongs] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const [albumsRes, artistsRes, songsRes, eventsRes] = await Promise.all([
                axios.get("api/music/albums"),
                axios.get("api/music/artists"),
                axios.get("api/music/songs"),
                axios.get("api/music/events"),

            ]);
            setAlbums(albumsRes.data);
            setArtists(artistsRes.data);
            setSongs(songsRes.data);
            setEvents(eventsRes.data);
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
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "2.5rem 3rem", // mai mult spațiu între casete
                justifyContent: "center",
            }}>
                {topSongs.map((song) => (
                    <SimpleSongCard key={song._id} song={song} />
                ))}
            </div>

            {/* 🌟 Weekly Artists */}
            <h2 style={{ marginTop: "2rem" }}>🌟 Weekly Artists</h2>
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "3rem 3.5rem",
                justifyContent: "center",
            }}>
                {topArtists.map((artist) => (
                    <SimpleInfoCard
                        key={artist._id}
                        to={`/artist/${artist._id}`}
                        image={artist.image}
                        title={artist.name}
                        description={artist.bio?.substring(0, 60) + (artist.bio?.length > 60 ? "..." : "")}
                    />
                ))}
            </div>

            {/* 🆕 Recent Albums */}
            <h2 style={{ marginTop: "2rem" }}>🆕 Recent Albums</h2>
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "3rem 3.5rem",
                justifyContent: "center",
            }}>
                {topAlbums.map((album) => (
                    <SimpleInfoCard
                        key={album._id}
                        to={`/album/${album._id}`}
                        image={album.coverImage}
                        title={album.title}
                        subtitle={album.artist?.name ? `By: ${album.artist.name}` : ""}
                        description={`Genre: ${album.genre}`}
                    />
                ))}
            </div>

            {/* 📅 Upcoming Events */}
            <h2 style={{ marginTop: "2rem" }}>📅 Upcoming Events</h2>
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "3rem 3.5rem",
                justifyContent: "center",
            }}>
                {events.map((ev) => (
                    <SimpleInfoCard
                        key={ev._id}
                        to={`/event/${ev._id}`}
                        title={ev.title}
                        subtitle={new Date(ev.date).toLocaleDateString("ro-RO", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                        description={ev.location}
                    />
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
