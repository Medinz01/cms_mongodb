// src/components/PagesTable.js
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

export default function PagesTable({ pages, tags = [] }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', tags: [] });

  const handleDeleteClick = (page) => {
    setSelectedPage(page);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedPage(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPage) return;
    const loadingToastId = toast.loading('Deleting page...');

    const res = await fetch(`/api/pages/${selectedPage._id}`, { method: 'DELETE' });
    toast.dismiss(loadingToastId);

    if (res.ok) {
      toast.success('Page deleted successfully!');
      router.refresh();
    } else {
      toast.error('Failed to delete page.');
    }
    handleCloseDeleteDialog();
  };

  const handleEditClick = (page) => {
    setSelectedPage(page);
    setFormData({
      title: page.title,
      content: page.content,
      tags: page.tags || []
    });
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedPage(null);
  };

  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTagChange = (e) => {
    const { value: tagId, checked } = e.target;
    setFormData(prev => {
      const newTags = checked
        ? [...prev.tags, tagId]
        : prev.tags.filter(id => id !== tagId);
      return { ...prev, tags: newTags };
    });
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPage) return;
    const loadingToastId = toast.loading('Updating page...');

    const res = await fetch(`/api/pages/${selectedPage._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    toast.dismiss(loadingToastId);

    if (res.ok) {
      toast.success('Page updated successfully!');
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: `/pages/${selectedPage.slug}`,
          secret: process.env.NEXT_PUBLIC_REVALIDATION_TOKEN
        }),
      });
      router.refresh();
      handleCloseEditModal();
    } else {
      toast.error('Failed to update page.');
    }
  };

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Slug</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page._id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{page.title}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>/pages/{page.slug}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  <Button variant="outlined" size="small" onClick={() => handleEditClick(page)}>Edit</Button>
                  {session?.user?.role === 'admin' && (
                    <Button variant="contained" color="error" size="small" sx={{ ml: 1 }} onClick={() => handleDeleteClick(page)}>
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. This will permanently delete the page "{selectedPage?.title}".
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      <Modal open={editModalOpen} onClose={handleCloseEditModal}>
        <Box sx={modalStyle} component="form" onSubmit={handleEditSubmit}>
          <Typography variant="h6" component="h2">Edit Page</Typography>
          <TextField
            name="title"
            label="Page Title"
            value={formData.title}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            name="content"
            label="Page Content"
            value={formData.content}
            onChange={handleFormChange}
            fullWidth
            required
            multiline
            rows={8}
          />
          <Box>
            <Typography variant="subtitle1">Tags</Typography>
            <FormGroup sx={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
              {tags.map(tag => (
                <FormControlLabel
                  key={tag._id}
                  control={
                    <Checkbox
                      value={tag._id}
                      checked={formData.tags.includes(tag._id)}
                      onChange={handleTagChange}
                    />
                  }
                  label={tag.name}
                />
              ))}
            </FormGroup>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button onClick={handleCloseEditModal} variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained">Save Changes</Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}