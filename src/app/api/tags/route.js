import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Tag from '@/models/Tag';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  await dbConnect();
  const tags = await Tag.find({}).sort({ name: 1 });
  return NextResponse.json(tags);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || !['admin', 'editor'].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await request.json();
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  await dbConnect();
  const newTag = new Tag({ name, slug });
  await newTag.save();

  return NextResponse.json(newTag, { status: 201 });
}