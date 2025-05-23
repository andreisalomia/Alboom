import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileEvents() {
  const { user: currentUser } = useAuth();
  const { userId } = useParams();
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!currentUser || currentUser._id !== userId) return;
    setLoading(true);
    axios
      .get(`/api/music/events/user/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(({ data }) => {
        setEvents(data);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError('Could not load events');
      })
      .finally(() => setLoading(false));
  }, [userId, currentUser]);

  if (loading) return <p>Loading events…</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;
  if (!events.length) return <p>You’re not participating in any events yet.</p>;

  return (
    <div>
      <h3>Your Events</h3>
      <ul>
        {events.map(ev => (
          <li key={ev._id} style={{ margin: '0.5rem 0' }}>
            <Link to={`/event/${ev._id}`}>
              <strong>{ev.title}</strong>
            </Link>
            <div>
              {new Date(ev.date).toLocaleDateString('ro-RO', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </div>
            <div>{ev.location}</div>
          </li>
        ))}
      </ul>
    </div>
  );

}
