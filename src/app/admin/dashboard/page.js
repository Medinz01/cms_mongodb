// app/admin/dashboard/page.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { getDashboardStats } from '@/lib/getDashboardStats';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['admin', 'editor'].includes(session.user.role)) {
    redirect('/login');
  }

  const stats = await getDashboardStats();

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <div style={{ display: 'flex', gap: '1rem', margin: '2rem 0' }}>
        <div style={cardStyle}><span style={statNumberStyle}>{stats.pageCount}</span> Total Pages</div>
        <div style={cardStyle}><span style={statNumberStyle}>{stats.userCount}</span> Total Users</div>
        <div style={cardStyle}><span style={statNumberStyle}>{stats.tagCount}</span> Total Tags</div>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <h2>Top Contributors</h2>
          <ul style={listStyle}>
            {stats.topContributors.map((user, i) => (
              <li key={i}>{user.name} ({user.count} pages)</li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <h2>Most Popular Tags</h2>
          <ul style={listStyle}>
            {stats.popularTags.map((tag, i) => (
              <li key={i}>{tag.name} ({tag.count} uses)</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  flex: 1,
  padding: '1.5rem',
  borderRadius: '8px',
  background: '#f9f9f9',
  border: '1px solid #eee',
  textAlign: 'center'
};
const statNumberStyle = {
  display: 'block',
  fontSize: '2.5rem',
  fontWeight: 'bold'
};
const listStyle = {
  listStyle: 'none',
  padding: 0
};