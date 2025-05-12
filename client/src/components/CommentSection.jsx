// client/src/components/CommentSection.jsx

import { useState, useEffect } from 'react';
import {
  getComments,
  postComment,
  deleteComment,
  likeComment,
  dislikeComment
} from '../api/comments';
import { useNavigate } from 'react-router-dom';

export default function CommentSection({ targetType, targetId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const navigate = useNavigate();

  const load = () =>
    getComments(targetType, targetId).then(res => setComments(res.data));

  useEffect(() => { load(); }, [targetType, targetId]);

  const handlePost = async () => {
    if (!newContent.trim()) return;
    await postComment({ targetType, targetId, parentId: replyTo, content: newContent });
    setNewContent(''); setReplyTo(null); load();
  };

  const handleDelete = async (id) => { await deleteComment(id); load(); };
  const handleLike   = async (id) => { await likeComment(id);   load(); };
  const handleDislike= async (id) => { await dislikeComment(id);load(); };

  // build nested tree
  const tree = [];
  const map = {};
  comments.forEach(c => map[c._id] = { ...c, replies: [] });
  comments.forEach(c => {
    if (c.parentId) map[c.parentId]?.replies.push(map[c._id]);
    else tree.push(map[c._id]);
  });

  const renderNode = (c, depth = 0) => {
    // compute avatar URL exactly as in UserProfile
    const avatarSrc = c.author.profileImage
      ? `/api/users/avatar/${c.author.profileImage}`
      : null;

    return (
      <div
        key={c._id}
        style={{
          marginLeft: depth * 20,
          borderTop: '1px solid #eee',
          padding: '8px 0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="avatar"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: 8
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
                marginRight: 8,
                fontSize: '1rem'
              }}
            >
              {c.author.name.charAt(0).toUpperCase()}
            </div>
          )}
          <strong
            onClick={() => navigate(`/profile/${c.author._id}`)}
            style={{ cursor: 'pointer', color: '#007bff' }}
          >
            {c.author.name}
          </strong>
          <span style={{ marginLeft: 8, color: '#666' }}>
            &middot; {new Date(c.createdAt).toLocaleString()}
          </span>
        </div>

        <p style={{ margin: '4px 0 8px' }}>{c.content}</p>

        <small>
          👍 {c.likes.length} &nbsp; 👎 {c.dislikes.length}
        </small>

        <div style={{ marginTop: '4px' }}>
          {currentUser && (
            <>
              <button onClick={() => handleLike(c._id)}>Like</button>
              <button onClick={() => handleDislike(c._id)}>Dislike</button>
              <button onClick={() => setReplyTo(c._id)}>Reply</button>
              {(currentUser.id === c.author._id ||
                ['moderator','admin'].includes(currentUser.role)) && (
                <button onClick={() => handleDelete(c._id)}>Delete</button>
              )}
            </>
          )}
        </div>

        {replyTo === c._id && (
          <div style={{ marginTop: 8 }}>
            <textarea
              rows={2}
              style={{ width: '100%', boxSizing: 'border-box' }}
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
            />
            <button onClick={handlePost}>Post reply</button>
          </div>
        )}

        {c.replies.map(r => renderNode(r, depth + 1))}
      </div>
    );
  };

  return (
    <div style={{ textAlign: 'left', width: '100%', padding: '2rem 1rem' }}>
      <h3>Comments</h3>

      {currentUser ? (
        <div style={{ marginBottom: '1rem' }}>
          <textarea
            rows={3}
            style={{ width: '100%', boxSizing: 'border-box' }}
            placeholder="Add a comment…"
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
          />
          <button onClick={handlePost} style={{ marginTop: '0.5rem' }}>
            Post Comment
          </button>
        </div>
      ) : (
        <p>Log in to leave a comment.</p>
      )}

      <div>
        {tree.map(c => renderNode(c))}
      </div>
    </div>
  );
}
