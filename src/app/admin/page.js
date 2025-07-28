// app/admin/page.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

import dbConnect from '@/lib/db';
import Page from '@/models/Page';
import Tag from '@/models/Tag';

import CreatePageForm from '@/components/CreatePageForm';
import PagesTable from '@/components/PagesTable';
import TagManager from '@/components/TagManager';

async function getPages() {
  await dbConnect();
  const pages = await Page.find({}).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(pages));
}

async function getTags() {
  await dbConnect();
  const tags = await Tag.find({}).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(tags));
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !['admin', 'editor'].includes(session.user.role)) {
    redirect('/login');
  }

  const [pages, tags] = await Promise.all([getPages(), getTags()]);

  return (
    <div>
      <h1>Admin Panel</h1>
      <hr style={{ margin: '2rem 0' }} />
      
      <h2>Create a New Page</h2>
      <CreatePageForm tags={tags} />

      <hr style={{ margin: '2rem 0' }} />
      <h2>Manage Tags</h2>
      <TagManager initialTags={tags} />
      
      <hr style={{ margin: '2rem 0' }} />

      <h2>Manage Existing Pages</h2>
      <PagesTable pages={pages} tags={tags} />
    </div>
  );
}