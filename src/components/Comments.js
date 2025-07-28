"use client";

import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

function CommentForm({ pageId, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/pages/${pageId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to post comment.");
      }

      const newComment = await res.json();
      toast.success("Comment posted!");
      setContent('');
      onCommentAdded(newComment); 
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
      <TextField
        label="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        fullWidth
        multiline
        rows={3}
        variant="outlined"
        disabled={isSubmitting}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        style={{ marginTop: '1rem' }}
      >
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </Button>
    </form>
  );
}

export default function Comments({ pageId, initialComments = [], isLoggedIn = false }) {
  const [comments, setComments] = useState(initialComments);

  const handleCommentAdded = (newComment) => {
    setComments(prevComments => [newComment, ...prevComments]);
  };

  return (
    <div style={{ marginTop: '3rem', borderTop: '1px solid #ddd', paddingTop: '2rem' }}>
      <h2>Comments ({comments.length})</h2>
      
      {isLoggedIn && <CommentForm pageId={pageId} onCommentAdded={handleCommentAdded} />}

      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px' }}>
              <p>{comment.content}</p>
              <small style={{ color: '#555' }}>
                by {comment.createdBy?.name || 'User'} on {new Date(comment.createdAt).toLocaleDateString()}
              </small>
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to write one!</p>
        )}
      </div>
    </div>
  );
}
