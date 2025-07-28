import dbConnect from '@/lib/db';
import Page from '@/models/Page';
import Tag from '@/models/Tag';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getPagesForTag(slug) {
  await dbConnect();
  const tag = await Tag.findOne({ slug }).lean();
  if (!tag) return null;

  const pages = await Page.find({ tags: tag._id }).populate('tags', 'name slug').lean();
  return { tag, pages };
}

export default async function TagPage({ params }) {
  const { slug } = await params; 
  const data = await getPagesForTag(slug);
  if (!data) notFound();

  const { tag, pages } = data;

  return (
    <div>
      <h1>Pages tagged with: "{tag.name}"</h1>
      <ul>
        {pages.map((page) => (
          <li key={page._id}>
            <Link href={`/pages/${page.slug}`}>{page.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}