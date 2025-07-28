"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Button from '@mui/material/Button';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

export default function BookmarkButtonWrapper({ pageId, initialIsBookmarked }) {
  const { status } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleBookmark = async () => {
    if (status !== 'authenticated') {
      toast.error('Please log in to bookmark a page.');
      return;
    }

    setIsSubmitting(true);
    const originalIsBookmarked = isBookmarked;
    setIsBookmarked(!isBookmarked);

    try {
      const res = await fetch(`/api/pages/${pageId}/bookmark`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update bookmark.');
      }
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message);
      setIsBookmarked(originalIsBookmarked);
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonText = isBookmarked ? 'Saved' : 'Save';
  const buttonIcon = isBookmarked ? <BookmarkAddedIcon /> : <BookmarkBorderIcon />;

  return (
    <Button
      onClick={handleBookmark}
      variant="text"
      startIcon={buttonIcon}
      disabled={!isClient || isSubmitting || status !== 'authenticated'}
      style={{ textTransform: 'none', color: '#555' }}
    >
      {buttonText}
    </Button>
  );
}
