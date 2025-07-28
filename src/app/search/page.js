// app/search/page.js
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Page from '@/models/Page';
import SearchBar from '@/components/Searchbar';

async function performSearch(query) {
  if (!query) {
    return [];
  }
  await dbConnect();

  const pages = await Page.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  )
  .sort({ score: { $meta: 'textScore' } })
  .lean();

  return JSON.parse(JSON.stringify(pages));
}

export default async function SearchPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  const results = await performSearch(query);

  return (
    <div>
      <h1>Search Results</h1>
      <p>Showing results for: <strong>{query}</strong></p>
      
      <div style={{ marginTop: '2rem' }}>
        {results.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {results.map((page) => (
              <li key={page._id} style={{ marginBottom: '1rem' }}>
                <Link href={`/pages/${page.slug}`} style={{ fontSize: '1.2rem', textDecoration: 'underline' }}>
                  {page.title}
                </Link>
                <p style={{ marginTop: '0.25rem' }}>{page.content.substring(0, 150)}...</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No pages found matching your search.</p>
        )}
      </div>
    </div>
  );
}