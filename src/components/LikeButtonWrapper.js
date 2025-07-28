"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Button from '@mui/material/Button';

export default function LikeButtonWrapper({ pageId, initialLikes, initialIsLiked }) {
  const { status } = useSession();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLike = async () => {
    if (status !== 'authenticated') {
      toast.error('Please log in to like a page.');
      return;
    }

    setIsSubmitting(true);
    const originalLikes = likes;
    const originalIsLiked = isLiked;
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);

    try {
      const res = await fetch(`/api/pages/${pageId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      });
      if (!res.ok) throw new Error('Failed to update like status');
    } catch (error) {
      toast.error("Something went wrong.");
      setIsLiked(originalIsLiked);
      setLikes(originalLikes);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      onClick={handleLike}
      variant={isLiked ? "contained" : "outlined"}
      disabled={!isClient || isSubmitting || status !== 'authenticated'}
    >
      {isLiked ? 'Unlike' : 'Like'} ({likes})
    </Button>
  );
}
