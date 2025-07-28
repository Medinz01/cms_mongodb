"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TagManager({ initialTags }) {
  const [tags, setTags] = useState(initialTags);
  const [newTagName, setNewTagName] = useState('');
  const router = useRouter();

  const handleCreateTag = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTagName }),
    });
    if (res.ok) {
      setNewTagName('');
      router.refresh(); 
    } else {
      alert('Failed to create tag.');
    }
  };

  return (
    <div>
      <form onSubmit={handleCreateTag} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input 
          type="text" 
          placeholder="New Tag Name" 
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
        />
        <button type="submit">Create Tag</button>
      </form>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {tags.map(tag => (
          <span key={tag._id} style={{ background: '#eee', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  );
}