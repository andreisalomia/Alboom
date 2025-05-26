import React from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfileReviews.css';

export default function ProfileReviews() {
  const { userData } = useProfile();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const isOwnProfile = currentUser && currentUser.id === userData?._id;

  if (!userData || !userData.reviews) {
    return <p>Loading reviews...</p>;
  }

  return (
    <div className="profile-reviews-container">
      <h2>{isOwnProfile ? "My Reviews" : "User Reviews"}</h2>
      {userData.reviews.length === 0 ? (
        <p>{isOwnProfile ? "You haven't written any reviews yet." : "This user hasn’t written any reviews yet."}</p>
      ) : (
        userData.reviews.map(review => {
          const targetUrl = `/${review.targetType}/${review.targetId}`;

          return (
            <div key={review._id} className="review-card">
              <div className="review-header">
                {review.image ? (
                  <img
                    src={review.image}
                    alt="Reviewed item"
                    className="review-image"
                  />
                ) : (
                  <div className="review-placeholder" />
                )}
                {/* TODO: cam urata asta */ }
                <div className="review-item-info">
                  <strong
                    className="review-item-name"
                    onClick={() => navigate(targetUrl)}
                    style={{ cursor: 'pointer' }}
                  >
                    {review.name}
                  </strong>
                  <div className="review-stars">
                    {[1,2,3,4,5].map(i => (
                      <span
                        key={i}
                        style={{
                          fontSize: '1.2rem',
                          color: i <= review.rating ? 'gold' : 'lightgray'
                        }}
                      >★</span>
                    ))}
                  </div>
                </div>
              </div>
              {review.content ? (
                <p className="review-content">{review.content}</p>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}