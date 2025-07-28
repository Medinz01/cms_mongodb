// src/components/CreatePageForm.js
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CreatePageForm({ tags = [] }) {
  const [formData, setFormData] = useState({ title: '', content: '', tags: [] });
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTagChange = (e) => {
    const { value: tagId, checked } = e.target;
    setFormData(prev => {
      if (checked) {
        return { ...prev, tags: [...prev.tags, tagId] };
      }
      else {
        return { ...prev, tags: prev.tags.filter(id => id !== tagId) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToastId = toast.loading('Creating page...');
    const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) 
    });
    toast.dismiss(loadingToastId);

    if (res.ok) {
      toast.success('Page created successfully!');
      router.refresh();
      setFormData({ title: '', content: '', tags: [] });
    } else {
      toast.error('Failed to create page.'); 
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
      <input 
        name="title" 
        type="text" 
        placeholder="Page Title" 
        value={formData.title} 
        onChange={handleInputChange} 
        required 
      />
      <textarea 
        name="content" 
        placeholder="Page Content" 
        value={formData.content} 
        onChange={handleInputChange} 
        rows="10" 
        required 
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
          {tags.map(tag => (
            <label key={tag._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                value={tag._id}
                checked={formData.tags.includes(tag._id)}
                onChange={handleTagChange}
              />
              {tag.name}
            </label>
          ))}
      </div>
      <button type="submit">Create Page</button>
    </form>
  );
}