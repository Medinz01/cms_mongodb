// app/api/pages/[id]/view/route.js
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '@/lib/db';
import Page from '@/models/Page';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(request, { params }) {
  const resolvedParams = await params;
  const pageId = resolvedParams.id;

  if (!Types.ObjectId.isValid(pageId)) {
    return NextResponse.json({ error: 'Invalid page ID' }, { status: 400 });
  }

  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    const pageUpdate = Page.findByIdAndUpdate(pageId, { $inc: { viewCount: 1 } }, { new: true });

    let userUpdate = Promise.resolve();
    if (session?.user?.id) {
      const userId = session.user.id;
      if (!Types.ObjectId.isValid(userId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
      }

      userUpdate = User.findByIdAndUpdate(
        userId,
        [
          {
            $set: {
              recentlyViewed: {
                $filter: {
                  input: '$recentlyViewed',
                  as: 'item',
                  cond: { $ne: ['$$item', pageId] },
                },
              },
            },
          },
          {
            $set: {
              recentlyViewed: {
                $slice: [{ $concatArrays: [[pageId], '$recentlyViewed'] }, 10],
              },
            },
          },
        ],
        { new: true }
      );
    }

    await Promise.all([pageUpdate, userUpdate]);

    return NextResponse.json({ message: 'View tracked' }, { status: 200 });
  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}