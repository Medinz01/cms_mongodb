import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Types } from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Page from '@/models/Page';
import Comment from '@/models/Comment';
import Bookmark from '@/models/Bookmark';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import FollowButtonWrapper from '@/components/FollowButtonWrapper';

const serialize = (data) => JSON.parse(JSON.stringify(data));

async function getUserProfileData(userId) {
  try {
    if (!Types.ObjectId.isValid(userId)) return null;
    await dbConnect();
    const [user, likedPages, comments, createdPages, bookmarks] = await Promise.all([
      User.findById(userId).lean(),
      Page.find({ likes: userId }).select('title slug').lean(),
      Comment.find({ createdBy: userId }).sort({ createdAt: -1 }).limit(5).populate('page', 'title slug').lean(),
      Page.find({ createdBy: userId }).sort({ createdAt: -1 }).limit(5).lean(),
      Bookmark.find({ user: userId }).sort({ createdAt: -1 }).populate('page', 'title slug').lean(),
    ]);
    if (!user) return null;
    return {
      user: serialize(user),
      likedPages: serialize(likedPages),
      comments: serialize(comments),
      createdPages: serialize(createdPages),
      bookmarks: serialize(bookmarks),
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export default async function ProfilePage({ params }) {
  const [session, data] = await Promise.all([
    getServerSession(authOptions),
    getUserProfileData(params.id),
  ]);

  if (!data) notFound();

  const { user, likedPages, comments, createdPages, bookmarks } = data;
  const initialIsFollowing = !!(session?.user && user.followers?.includes(session.user.id));

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', fontFamily: 'sans-serif' }}>
      {/* User Info Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
        <img src={user.image || '/default-avatar.png'} alt={user.name} style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>{user.name}</h1>
          <div style={{ display: 'flex', gap: '1.5rem', color: '#666', marginBottom: '1rem' }}>
            <span>{user.followers?.length || 0} Followers</span>
            <span>{user.following?.length || 0} Following</span>
          </div>
          <FollowButtonWrapper targetUserId={user._id} initialIsFollowing={initialIsFollowing} />
        </div>
      </div>
      <hr style={{ margin: '2rem 0' }} />

      {/* --- NEW: Bookmarks Section --- */}
      <h2>Reading List</h2>
      {bookmarks.length > 0 ? (
        <ul>
          {bookmarks.map((bookmark) => (
            <li key={bookmark._id}>
              {/* The page field is populated, so we can access its properties */}
              <Link href={`/pages/${bookmark.page.slug}`}>{bookmark.page.title}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No saved pages in the reading list.</p>
      )}
      <hr style={{ margin: '2rem 0' }} />

      {/* Other sections */}
      <h2>Pages Created</h2>
      {createdPages.length > 0 ? ( <ul> {createdPages.map((page) => ( <li key={page._id}> <Link href={`/pages/${page.slug}`}>{page.title}</Link> </li> ))} </ul> ) : ( <p>{user.name} hasn't created any pages yet.</p> )}
      <hr style={{ margin: '2rem 0' }} />
      <h2>Recent Comments</h2>
      {comments.length > 0 ? ( <ul> {comments.map((comment) => ( <li key={comment._id} style={{ marginBottom: '1rem' }}> <p style={{ margin: 0 }}> On <Link href={`/pages/${comment.page.slug}`}>{comment.page.title}</Link>: </p> <blockquote style={{ margin: '0.5rem 0 0 0', borderLeft: '3px solid #ccc', paddingLeft: '1rem', fontStyle: 'italic' }}> "{comment.content}" </blockquote> </li> ))} </ul> ) : ( <p>No recent comments.</p> )}
      <hr style={{ margin: '2rem 0' }} />
      <h2>Liked Pages</h2>
      {likedPages.length > 0 ? ( <ul> {likedPages.map((page) => ( <li key={page._id}> <Link href={`/pages/${page.slug}`}>{page.title}</Link> </li> ))} </ul> ) : ( <p>No liked pages yet.</p> )}
    </div>
  );
}
