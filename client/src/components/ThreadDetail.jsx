import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CommentSection from './CommentSection';

export default function ThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  useEffect(() => {
    fetchThread();
  }, [id]);

  const fetchThread = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/threads/${id}`);
      if (!response.ok) {
        throw new Error('Thread not found');
      }
      const data = await response.json();
      setThread(data.thread);

      // Check if current user has liked/disliked this thread
      if (user && data.thread) {
        setLiked(data.thread.likes?.includes(user.id) || data.thread.likes?.includes(user._id) || false);
        setDisliked(data.thread.dislikes?.includes(user.id) || data.thread.dislikes?.includes(user._id) || false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please log in to like threads');
      return;
    }

    try {
      const response = await fetch(`/api/threads/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setDisliked(false); // Remove dislike if present
        setThread(prev => ({
          ...prev,
          likesCount: data.likesCount,
          dislikesCount: data.dislikesCount
        }));
      } else {
        alert('Failed to like thread');
      }
    } catch (error) {
      alert('Error liking thread');
    }
  };

  const handleDislike = async () => {
    if (!user) {
      alert('Please log in to dislike threads');
      return;
    }

    try {
      const response = await fetch(`/api/threads/${id}/dislike`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDisliked(data.disliked);
        setLiked(false); // Remove like if present
        setThread(prev => ({
          ...prev,
          likesCount: data.likesCount,
          dislikesCount: data.dislikesCount
        }));
      } else {
        alert('Failed to dislike thread');
      }
    } catch (error) {
      alert('Error disliking thread');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this thread?')) return;

    try {
      const response = await fetch(`/api/threads/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        navigate('/threads');
      } else {
        alert('Failed to delete thread');
      }
    } catch (error) {
      alert('Error deleting thread');
    }
  };

  const canDelete = user && thread && (
    user.id === thread.creator?._id ||
    user._id === thread.creator?._id ||
    user.role === 'admin' ||
    user.role === 'moderator'
  );

  if (loading) return <div style={{ padding: '2rem' }}>Loading thread...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;
  if (!thread) return <div style={{ padding: '2rem' }}>Thread not found</div>;

  // Handle avatarSrc for profile image
  const avatarSrc = thread.creator?.profileImage
    ? `/api/users/avatar/${thread.creator.profileImage}`
    : '/path/to/default/avatar.png'; // Fallback to a default image if no profile picture

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/threads')}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ← Back to Threads
      </button>

      {/* Thread content */}
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '2rem',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        {/* Thread header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={avatarSrc}
              alt="avatar"
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <div>
              <strong
                onClick={() => navigate(`/profile/${thread.creator._id}`)}
                style={{ cursor: 'pointer', color: '#007bff' }}
              >
                {thread.creator?.name || 'Unknown User'}
              </strong>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                Posted: {new Date(thread.createdAt).toLocaleDateString()} at {new Date(thread.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {canDelete && (
            <button
              onClick={handleDelete}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Delete Thread
            </button>
          )}
        </div>

        {/* Thread title and content */}
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '1.8rem' }}>
          {thread.title}
        </h1>
        <div
          style={{
            margin: '0 0 1.5rem 0',
            lineHeight: 1.6,
            fontSize: '1rem'
          }}
          dangerouslySetInnerHTML={{ __html: thread.content }}
        />

        {/* Thread reactions */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
          <span style={{ fontSize: '0.9rem', color: '#888' }}>
            💬 {thread.commentsCount || 0} comments
          </span>

          {user && (
            <>
              <button
                onClick={handleLike}
                style={{
                  backgroundColor: liked ? '#28a745' : 'transparent',
                  color: liked ? 'white' : '#28a745',
                  border: '1px solid #28a745',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span role="img" aria-label="thumbs-up">👍</span> {thread.likesCount || 0}
              </button>

              <button
                onClick={handleDislike}
                style={{
                  backgroundColor: disliked ? '#dc3545' : 'transparent',
                  color: disliked ? 'white' : '#dc3545',
                  border: '1px solid #dc3545',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span role="img" aria-label="thumbs-down">👎</span> {thread.dislikesCount || 0}
              </button>
            </>
          )}

          {!user && (
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              <span role="img" aria-label="thumbs-up">👍</span> {thread.likesCount || 0}
              {' '}
              <span role="img" aria-label="thumbs-down">👎</span> {thread.dislikesCount || 0}
            </div>
          )}
        </div>
      </div>

      {/* Comments section */}
      <CommentSection
        targetType="thread"
        targetId={id}
        currentUser={user}
      />
    </div>
  );
}
