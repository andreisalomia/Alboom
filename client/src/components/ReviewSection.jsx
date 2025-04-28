import { useState, useEffect } from 'react';
import { getReviews, toggleReview } from '../api/reviews';
import { jwtDecode } from 'jwt-decode';

export default function ReviewSection({ targetType, targetId }) {
  const [reviews, setReviews]       = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating]   = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  // load current user from token
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) setCurrentUser(jwtDecode(token));
    } catch {}
  }, []);

  // fetch reviews & compute avg and user’s own
  const load = async () => {
    const { data } = await getReviews(targetType, targetId);
    setReviews(data);
    const sum = data.reduce((acc, r) => acc + r.rating, 0);
    const avg = data.length ? sum / data.length : 0;
    setAvgRating(avg);

    if (currentUser) {
      const mine = data.find(r => r.author._id === currentUser.id);
      setUserRating(mine ? mine.rating : 0);
    }
  };

  useEffect(() => { load(); }, [targetType, targetId, currentUser]);

  const handleStar = async (star) => {
    if (!currentUser) return;
    await toggleReview({ targetType, targetId, rating: star });
    load();
  };

  const roundedAvg = Math.round(avgRating);

  return (
    <div style={{ textAlign: 'center', margin: '1rem 0' }}>
      {/* Average (read-only) */}
      <div>
        <strong>Average rating:</strong> {avgRating.toFixed(1)} / 5
      </div>
      <div style={{ margin: '0.25rem 0' }}>
        {[1,2,3,4,5].map(i => (
          <span
            key={i}
            style={{
              fontSize: '1.5rem',
              color: i <= roundedAvg ? 'blue' : 'lightgray',
              margin: '0 3px'
            }}
          >★</span>
        ))}
      </div>

      {/* Your rating (interactive) */}
      <div>
        {[1,2,3,4,5].map(i => (
          <span
            key={i}
            onClick={() => handleStar(i)}
            style={{
              cursor: currentUser ? 'pointer' : 'default',
              fontSize: '1.5rem',
              color: i <= userRating ? 'gold' : 'lightgray',
              margin: '0 3px'
            }}
          >★</span>
        ))}
      </div>
    </div>
  );
}
