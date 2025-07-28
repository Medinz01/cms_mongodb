"use client";

import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '@mui/material/Button';
import { useSession } from 'next-auth/react';

export default function FollowButtonWrapper({ targetUserId, initialIsFollowing }) {
  const { data: session, status } = useSession();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    if (status !== 'authenticated') {
      toast.error("Please log in to follow users.");
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch(`/api/pages/${targetUserId}/follow`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update follow status.");
      }
      
      const data = await res.json();
      setIsFollowing(data.isFollowing);
      toast.success(data.message);

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (session?.user?.id === targetUserId) {
    return null;
  }
  
  if (status === 'loading') {
      return null;
  }

  return (
    <Button
      variant={isFollowing ? "outlined" : "contained"}
      onClick={handleFollow}
      disabled={isLoading}
    >
      {isLoading ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
    </Button>
  );
}
