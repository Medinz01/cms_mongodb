// app/api/pages/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Page from '@/models/Page';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || !['admin', 'editor'].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { title, content, tags } = await request.json();
  const slug = title.toLowerCase().replace(/\s+/g, '-');
  await dbConnect();

  const newPage = new Page({
    title,
    slug,
    content,
    tags,
    createdBy: session.user.id,
    lastEditedBy: session.user.id,
  });
  await newPage.save();

  return NextResponse.json({ message: 'Page created!' }, { status: 201 });
}