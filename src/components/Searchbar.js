"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './SearchBar.module.css'; 

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ pages: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ pages: [], users: [] });
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${query}`, { signal });
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setResults(data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchData();
    }, 300);

    return () => {
      clearTimeout(debounce);
      controller.abort(); 
    };
  }, [query]);

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for pages or users..."
        className={styles.searchInput}
      />
      {isLoading && <div className={styles.loading}>Searching...</div>}
      
      {results.pages.length > 0 || results.users.length > 0 ? (
        <div className={styles.resultsDropdown}>
          {results.users.length > 0 && (
            <div className={styles.resultsSection}>
              <h4 className={styles.resultsHeader}>Users</h4>
              {results.users.map(user => (
                <Link key={user._id} href={`/profile/${user._id}`} onClick={() => setQuery('')}>
                  <div className={styles.resultItem}>
                    <img src={user.image || '/default-avatar.png'} alt={user.name} className={styles.avatar} />
                    {user.name}
                  </div>
                </Link>
              ))}
            </div>
          )}
          {results.pages.length > 0 && (
            <div className={styles.resultsSection}>
              <h4 className={styles.resultsHeader}>Pages</h4>
              {results.pages.map(page => (
                <Link key={page._id} href={`/pages/${page.slug}`} onClick={() => setQuery('')}>
                  <div className={styles.resultItem}>{page.title}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        query.length >= 2 && !isLoading && <div className={styles.noResults}>No results found.</div>
      )}
    </div>
  );
}
