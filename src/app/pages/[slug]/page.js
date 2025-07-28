import dbConnect from "@/lib/db";
import Page from "@/models/Page";
import Comment from "@/models/Comment";
import Bookmark from "@/models/Bookmark";
import Tag from "@/models/Tag";
import { notFound } from "next/navigation";
import Link from "next/link";
import ViewTracker from "@/components/ViewTracker";
import LikeButtonWrapper from "@/components/LikeButtonWrapper";
import BookmarkButtonWrapper from "@/components/BookmarkButtonWrapper";
import Comments from "@/components/Comments";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function getPageData(slug, session) {
  await dbConnect();
  const page = await Page.findOne({ slug }).populate("createdBy", "name").populate("lastEditedBy", "name").populate("tags", "name slug").lean();
  if (!page) return null;

  const comments = await Comment.find({ page: page._id }).populate('createdBy', 'name').sort({ createdAt: -1 }).lean();
  page.comments = comments;

  let isLiked = false;
  let isBookmarked = false;
  if (session?.user) {
    const [likeResult, bookmarkResult] = await Promise.all([
      Page.countDocuments({ _id: page._id, likes: session.user.id }),
      Bookmark.countDocuments({ user: session.user.id, page: page._id })
    ]);
    isLiked = likeResult > 0;
    isBookmarked = bookmarkResult > 0;
  }
  
  return { page: JSON.parse(JSON.stringify(page)), isLiked, isBookmarked };
}

export default async function DynamicPage({ params }) {
  const session = await getServerSession(authOptions);
  const { slug } = params;
  const data = await getPageData(slug, session);

  if (!data) notFound();
  
  const { page, isLiked, isBookmarked } = data;
  const createdDate = new Date(page.createdAt).toLocaleDateString();

  return (
    <div>
      <ViewTracker pageId={page._id} />
      <h1>{page.title}</h1>
      <div style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        {page.createdBy && <span>Created by {page.createdBy.name} on {createdDate}</span>}
        <br />
        {page.lastEditedBy && <span>Last updated by {page.lastEditedBy.name}</span>}
      </div>

      <div style={{ display: "flex", alignItems: 'center', gap: "1.5rem", color: "#666", margin: "1rem 0" }}>
        <span>{page.viewCount || 0} Views</span>
        <span>{page.likeCount || 0} Likes</span>
        <span>{page.commentCount || 0} Comments</span>
      </div>

      {page.tags && page.tags.length > 0 && (
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <strong>Tags:</strong>
              {page.tags.map((tag) => (
                  <Link key={tag._id} href={`/tags/${tag.slug}`} style={{ textDecoration: "underline" }}>
                      {tag.name}
                  </Link>
              ))}
          </div>
      )}

      <div style={{ marginTop: "1rem", display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '0.5rem 0' }}>
        <LikeButtonWrapper
          pageId={page._id}
          initialLikes={page.likeCount || 0}
          initialIsLiked={isLiked}
        />
        <BookmarkButtonWrapper
          pageId={page._id}
          initialIsBookmarked={isBookmarked}
        />
      </div>

      <div style={{ marginTop: "2rem" }} dangerouslySetInnerHTML={{ __html: page.content }} />
      
      <Comments pageId={page._id} initialComments={page.comments} isLoggedIn={!!session} />
    </div>
  );
}
