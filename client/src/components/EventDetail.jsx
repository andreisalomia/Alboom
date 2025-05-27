import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ReportReasonModal from './ReportReasonModal';
import { reportTarget, unreportTarget } from '../api/reports';

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

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reported, setReported] = useState(false);

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
      const partIds = Array.isArray(data.participants) ? data.participants : [];
      setCount(partIds.length);
      if (currentUser) {
        setIsParticipating(partIds.includes(currentUser.id));
      }
    });
  }, [id, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const checkReport = async () => {
      try {
        const res = await axios.get("/api/reports", {
          params: { type: "event", targetId: id },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setReported(
          Array.isArray(res.data) &&
          res.data.some(
            (r) =>
              r.reporter === currentUser.id ||
              r.reporter === currentUser._id
          )
        );
      } catch {
        setReported(false);
      }
    };
    checkReport();
  }, [id, currentUser]);

  const handleParticipate = async () => {
    try {
      const res = await axios.post(`/api/music/events/${id}/participate`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setCount(res.data.participantsCount);
      setIsParticipating(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Error participating');
    }
  };

  const handleCancel = async () => {
    try {
      const res = await axios.delete(`/api/music/events/${id}/participate`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setCount(res.data.participantsCount);
      setIsParticipating(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error cancelling participation');
    }
  };

  const loadParticipants = async () => {
    try {
      const res = await axios.get(`/api/music/events/${id}/participants`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setParticipants(res.data.participants);
      setShowList(true);
    } catch {
      alert('Could not load participants');
    }
  };

  const handleOpenReportModal = () => setReportModalOpen(true);

  const handleSendReport = async (reason) => {
    await reportTarget("event", id, `/event/${id}`, reason);
    setReportModalOpen(false);
    setReported(true);
  };

  const handleCancelReport = () => setReportModalOpen(false);

  const handleUnreport = async () => {
    await unreportTarget("event", id);
    setReported(false);
  };

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading…</div>;
  if (error) return <div style={{ color: 'red', padding: "2rem", textAlign: "center" }}>Error loading event.</div>;
  if (!event) return <div style={{ padding: "2rem", textAlign: "center" }}>Event not found.</div>;

  return (
    <div style={{
      maxWidth: 700,
      margin: "2.5rem auto",
      background: "white",
      borderRadius: 16,
      boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
      padding: "2.5rem 2rem"
    }}>
      <h1 style={{
        fontSize: "2.2rem",
        fontWeight: 700,
        marginBottom: "0.5rem",
        color: "#23272f"
      }}>{event.title}</h1>
      <div style={{ color: "#666", marginBottom: "1.2rem" }}>
        {new Date(event.date).toLocaleString('ro-RO', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
      <div style={{ marginBottom: "1.2rem", color: "#444" }}>
        <strong>Location:</strong> {event.location}
      </div>
      <div style={{
        marginBottom: "1.5rem",
        color: "#333",
        fontSize: "1.1rem",
        lineHeight: 1.6
      }}>
        {event.description}
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        marginBottom: "1.5rem"
      }}>
        <div style={{
          background: "#f5f6fa",
          borderRadius: 8,
          padding: "0.7rem 1.2rem",
          fontWeight: 600,
          color: "#4158D0"
        }}>
          <span style={{ marginRight: 8 }}>👥</span>
          {count} participanți
        </div>
        {currentUser && (
          reported ? (
            <button
              onClick={handleUnreport}
              style={{
                background: "#bbb",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "0.4rem 1.2rem",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "1rem"
              }}
            >
              Remove Report
            </button>
          ) : (
            <button
              onClick={handleOpenReportModal}
              style={{
                background: "#dc3545",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "0.4rem 1.2rem",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "1rem"
              }}
            >
              Report Event
            </button>
          )
        )}
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        {currentUser ? (
          isParticipating ? (
            <button
              onClick={handleCancel}
              style={{
                background: "#bbb",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "0.4rem 1.2rem",
                fontWeight: 500,
                fontSize: "1rem"
              }}
            >
              Cancel Participation
            </button>
          ) : (
            <button
              onClick={handleParticipate}
              style={{
                background: "#3498db",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "0.4rem 1.2rem",
                fontWeight: 500,
                fontSize: "1rem"
              }}
            >
              Participate
            </button>
          )
        ) : (
          <span style={{ color: "#888" }}>Please log in to participate.</span>
        )}

        <button
          onClick={loadParticipants}
          style={{
            background: "#f5f6fa",
            color: "#4158D0",
            border: "none",
            borderRadius: 4,
            padding: "0.4rem 1.2rem",
            fontWeight: 500,
            fontSize: "1rem"
          }}
        >
          {showList ? 'Refresh List' : 'Vezi participanți'}
        </button>
      </div>

      {showList && (
        <div style={{
          background: "#f9f9fb",
          borderRadius: 8,
          padding: "1rem 1.5rem",
          marginBottom: "1rem",
          boxShadow: "0 1px 4px rgba(44,62,80,0.06)"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#4158D0" }}>Participanți</h3>
          <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
            {participants.length === 0 ? (
              <li style={{ color: "#888" }}>Niciun participant.</li>
            ) : (
              participants.map(p => (
                <li key={p._id} style={{
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #eee",
                  fontSize: "1rem"
                }}>
                  <span style={{ fontWeight: 500 }}>{p.name}</span>
                  <span style={{ color: "#888", marginLeft: 8 }}>{p.email}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      <ReportReasonModal
        open={reportModalOpen}
        onSend={handleSendReport}
        onCancel={handleCancelReport}
      />
    </div>
  );
}