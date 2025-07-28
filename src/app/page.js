// app/page.js
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Page from '@/models/Page';

async function getPages() {
  await dbConnect();
  const pages = await Page.find({}).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(pages));
}

export default async function HomePage() {
  const pages = await getPages();

  return (
    <div>
      <h1>Welcome to the CMS</h1>
      <p>Here are the pages created by the admin:</p>
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