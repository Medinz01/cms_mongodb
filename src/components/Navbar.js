// components/Navbar.js
"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import SearchBar from './Searchbar';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #ccc', alignItems: 'center' }}>
      <Link href="/">Home</Link>
      {status === 'authenticated' && ['admin', 'editor'].includes(session.user.role) && (
        <>
          <Link href="/admin/dashboard">Dashboard</Link>
          <Link href="/admin">Manage Content</Link>
        </>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <>
        <SearchBar />
        </>
        {status === 'unauthenticated' && (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
        {status === 'authenticated' && (
          <>
            <Link href={`/profile/${session.user.id}`}>
              <span>Welcome, {session.user.name}</span>
            </Link>
            <button onClick={() => signOut({ callbackUrl: '/' })}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}