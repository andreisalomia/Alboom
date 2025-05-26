import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const eventCache = {};

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [isParticipating, setIsParticipating] = useState(false);
  const [count, setCount] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [showList, setShowList] = useState(false);

  // Decode current user from token
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        setCurrentUser(jwtDecode(token));
      }
    } catch {
      setCurrentUser(null);
    }
  }, []);

  // Fetch event detail
  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      setLoading(true);
      try {
        if (eventCache[id]) {
          return eventCache[id];
        }
        const res = await axios.get(`/api/music/events/${id}`);
        eventCache[id] = res.data;
        return res.data;
      } catch (err) {
        setError(true);
        return null;
      } finally {
        setLoading(false);
      }
    };

    fetchEvent().then(data => {
      if (!data) return;
      setEvent(data);
      // Initialize count and participation state
      const partIds = Array.isArray(data.participants) ? data.participants : [];
      setCount(partIds.length);
      if (currentUser) {
        setIsParticipating(partIds.includes(currentUser.id));
      }
    });
  }, [id, currentUser]);

  // Handler: participate
  const handleParticipate = async () => {
    try {
      const res = await axios.post(`/api/music/events/${id}/participate`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setCount(res.data.participantsCount);
      setIsParticipating(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error participating');
    }
  };

  // Handler: cancel participation
  const handleCancel = async () => {
    try {
      const res = await axios.delete(`/api/music/events/${id}/participate`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setCount(res.data.participantsCount);
      setIsParticipating(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error cancelling participation');
    }
  };

  // Load participant list
  const loadParticipants = async () => {
    try {
      const res = await axios.get(`/api/music/events/${id}/participants`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setParticipants(res.data.participants);
      setShowList(true);
    } catch (err) {
      console.error(err);
      alert('Could not load participants');
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: 'red' }}>Error loading event.</p>;
  if (!event) return <p>Event not found.</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h1>{event.title}</h1>
      <p>
        {new Date(event.date).toLocaleString('ro-RO', {
          day:   '2-digit',
          month: 'long',
          year:  'numeric',
          hour:  '2-digit',
          minute:'2-digit',
        })}
      </p>
      <p><strong>Location:</strong> {event.location}</p>
      <p>{event.description}</p>

      <div style={{ margin: '1rem 0' }}>
        <strong>Participanți:</strong> {count}
      </div>

      {currentUser ? (
        isParticipating ? (
          <button onClick={handleCancel}>Cancel Participation</button>
        ) : (
          <button onClick={handleParticipate}>Participate</button>
        )
      ) : (
        <p>Please log in to participate.</p>
      )}

      <button onClick={loadParticipants} style={{ marginLeft: '1rem' }}>
        {showList ? 'Refresh List' : 'Vezi participanți'}
      </button>

      {showList && (
        <ul>
          {participants.map(p => (
            <li key={p._id}>{p.name} ({p.email})</li>
          ))}
        </ul>
      )}
    </div>
  );
}
