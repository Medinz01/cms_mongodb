// app/api/pages/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Page from '@/models/Page';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !['admin', 'editor'].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { title, content } = await request.json();
  const slug = title.toLowerCase().replace(/\s+/g, '-');

  await dbConnect();
  await Page.findByIdAndUpdate(id, {
    title,
    content,
    slug,
    lastEditedBy: session.user.id, 
  });

  return NextResponse.json({ message: 'Page updated successfully' }, { status: 200 });
}

export async function DELETE(request, { params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await dbConnect();
  await Page.findByIdAndDelete(id);

  return NextResponse.json({ message: 'Page deleted successfully' }, { status: 200 });
}