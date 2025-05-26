import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateThreadModal from './CreateThreadModal';

export default function ThreadsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'likes', 'comments'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const threadsPerPage = 25;

  useEffect(() => {
    fetchThreads();
  }, [currentPage, sortBy]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/threads?page=${currentPage}&limit=${threadsPerPage}&sortBy=${sortBy}`);
      if (!response.ok) {
        throw new Error('Failed to fetch threads');
      }
      const data = await response.json();
      setThreads(data.threads || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handleThreadCreated = (newThread) => {
    // Add the new thread to the beginning of the list
    setThreads(prev => [newThread, ...prev]);
    setShowCreateModal(false);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading threads...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Community Threads</h1>        {user && (
          <button 
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => setShowCreateModal(true)}
          >
            Create Thread
          </button>
        )}
      </div>

      {/* Sorting Controls */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span>Sort by:</span>
        <select 
          value={sortBy} 
          onChange={(e) => handleSortChange(e.target.value)}
          style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="date">Date Posted</option>
          <option value="likes">Most Liked</option>
          <option value="comments">Most Comments</option>
        </select>
      </div>

      {/* Threads List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {threads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            No threads found. {user ? 'Be the first to create one!' : 'Please log in to create threads.'}
          </div>
        ) : (          threads.map(thread => (
            <ThreadCard 
              key={thread._id} 
              thread={thread} 
              currentUser={user}
              onDelete={() => fetchThreads()}
              onNavigate={(url) => navigate(url)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button 
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1
          }}
        >
          Previous
        </button>
        <span style={{ display: 'flex', alignItems: 'center' }}>Page {currentPage}</span>
        <button 
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={threads.length < threadsPerPage}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: threads.length < threadsPerPage ? 'not-allowed' : 'pointer',
            opacity: threads.length < threadsPerPage ? 0.5 : 1
          }}
        >          Next
        </button>
      </div>

      {/* Create Thread Modal */}
      <CreateThreadModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onThreadCreated={handleThreadCreated}
      />
    </div>
  );
}

// Thread Card Component
function ThreadCard({ thread, currentUser, onDelete, onNavigate }) {
  const canDelete = currentUser && (
    currentUser.id === thread.creator?._id || 
    currentUser._id === thread.creator?._id ||
    currentUser.role === 'admin' || 
    currentUser.role === 'moderator'
  );

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    if (!window.confirm('Are you sure you want to delete this thread?')) return;
    
    try {
      const response = await fetch(`/api/threads/${thread._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        onDelete();
      } else {
        alert('Failed to delete thread');
      }
    } catch (error) {
      alert('Error deleting thread');
    }
  };

  const handleCardClick = () => {
    onNavigate(`/threads/${thread._id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease',
        ':hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {/* Thread header with author info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {thread.creator?.profileImage ? (
              <img
                src={`/api/users/avatar/${thread.creator.profileImage}`}
                alt="avatar"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#ccc',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem'
                }}
              >
                {thread.creator?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <strong style={{ fontSize: '0.9rem' }}>{thread.creator?.name || 'Unknown'}</strong>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                {new Date(thread.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Thread title */}
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>
            {thread.title}
          </h3>

          {/* Thread content preview */}
          <div 
            style={{ 
              margin: '0 0 1rem 0', 
              color: '#666', 
              lineHeight: 1.5,
              maxHeight: '100px',
              overflow: 'hidden',
              fontSize: '0.9rem'
            }}
            dangerouslySetInnerHTML={{ __html: thread.content }}
          />
          
          {/* Thread stats */}
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#888' }}>
            <span>💬 {thread.commentsCount || 0} comments</span>
            <span role="img" aria-label="thumbs-up">👍 {thread.likesCount || 0}</span>
            <span role="img" aria-label="thumbs-down">👎 {thread.dislikesCount || 0}</span>
          </div>
        </div>
        
        {canDelete && (
          <button
            onClick={handleDelete}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
