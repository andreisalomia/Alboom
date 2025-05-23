import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const eventCache = {};

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
    useEffect(() => {
      try {
        const token = localStorage.getItem("token");
        if (token) setCurrentUser(jwtDecode(token));
      } catch {}
    }, []);

  useEffect(() => {
    if (!id) return;
    if (eventCache[id]) {
      setEvent(eventCache[id]);
      setLoading(false);
      return;
    }
    setLoading(true);
    axios.get(`/api/music/events/${id}`)
      .then(res => {
        eventCache[id] = res.data;
        setEvent(res.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;
  if (!event)  return null;

  // const isParticipating = event.participants
  //   .map(p => p._id || p) // fie string, fie obiect populat
  //   .includes(userId);

  // const toggle = async () => {
  //   setBusy(true);
  //   try {
  //     if (isParticipating) {
  //       await cancelParticipation(event._id);
  //       setEvent(ev => ({
  //         ...ev,
  //         participants: ev.participants.filter(p => (p._id||p) !== userId),
  //       }));
  //     } else {
  //       await participateEvent(event._id);
  //       setEvent(ev => ({
  //         ...ev,
  //         participants: [...ev.participants, { _id: userId }],
  //       }));
  //     }
  //   } catch {
  //     alert('Operation failed');
  //   } finally {
  //     setBusy(false);
  //   }
  // };

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

      {/* <p>
        <strong>Participanți:</strong> {event.participants.length}
      </p>
      <button onClick={toggle} disabled={busy}>
        {isParticipating ? 'Anulează participarea' : 'Participă'}
      </button> */}
    </div>
  );
}


// import React, { useEffect, useState } from 'react';
// import { participate, cancelParticipation, fetchParticipants } from '../api/eventService';
// import { jwtDecode } from 'jwt-decode';
// const EventDetail = ({ event }) => {
//   const [user, setUser] = useState(null);
//     useEffect(() => {
//       try {
//         const token = localStorage.getItem("token");
//         if (token) setUser(jwtDecode(token));
//       } catch {}
//     }, []);
//   const [isParticipating, setIsParticipating] = useState(false);
//   const [count, setCount] = useState(event.participants.length);
//   const [participants, setParticipants] = useState([]);
//   const [showList, setShowList] = useState(false);

//   useEffect(() => {
//     // Verifică dacă current user e în lista inițială
//     setIsParticipating(event.participants.some(id => id === user.id));
//   }, [event.participants, user.id]);

//   const handleParticipate = async () => {
//     try {
//       const res = await participate(event._id);
//       setCount(res.data.participantsCount);
//       setIsParticipating(true);
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || 'Failed to participate');
//     }
//   };

//   const handleCancel = async () => {
//     try {
//       const res = await cancelParticipation(event._id);
//       setCount(res.data.participantsCount);
//       setIsParticipating(false);
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || 'Failed to cancel');
//     }
//   };

//   const loadParticipants = async () => {
//     try {
//       const res = await fetchParticipants(event._id);
//       setParticipants(res.data.participants);
//       setShowList(true);
//     } catch (err) {
//       console.error(err);
//       alert('Could not load participants');
//     }
//   };

//   return (
//     <div>
//       <h1>{event.title}</h1>
//       <p>{event.description}</p>
//       <p>Data: {new Date(event.date).toLocaleString()}</p>
//       <p>Locație: {event.location}</p>

//       <div>
//         <strong>Participanți: </strong> {count}
//       </div>

//       {isParticipating ? (
//         <button onClick={handleCancel}>Cancel Participation</button>
//       ) : (
//         <button onClick={handleParticipate}>Participate</button>
//       )}

//       <button onClick={loadParticipants}>Vezi participanți</button>

//       {showList && (
//         <ul>
//           {participants.map(p => (
//             <li key={p._id}>{p.name} ({p.email})</li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default EventDetail;
