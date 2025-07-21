'use client';

import { useEffect, useState } from 'react';

interface RankedBook {
  book_id: number;
  title: string;
  issue: string;
  page_length: number;
  cover_url: string;
  read_count: number;
  rank: number;
  authors: string[];
  publishers: string[];
}

export default function GlobalRankingsPage() {
  const [books, setBooks] = useState<RankedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'rank' | 'title' | 'pages' | 'read_count'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchGlobalRankings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/global-rankings?year=${selectedYear}`);
        const data = await res.json();
        setBooks(data.books || []);
        
        // If available years aren't set yet, fetch them
        if (availableYears.length === 0 && data.available_years) {
          setAvailableYears(data.available_years);
        }
      } catch (error) {
        console.error('Error fetching global rankings:', error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalRankings();
  }, [selectedYear]);

  useEffect(() => {
    // Fetch available years on component mount
    const fetchAvailableYears = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/global-rankings/years`);
        const data = await res.json();
        setAvailableYears(data.years || []);
      } catch (error) {
        console.error('Error fetching available years:', error);
        // Fallback to recent years if API fails
        const currentYear = new Date().getFullYear();
        setAvailableYears([currentYear, currentYear - 1, currentYear - 2, currentYear - 3]);
      }
    };

    fetchAvailableYears();
  }, []);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return { backgroundColor: "#ffd700", color: "#8b6914" };
    if (rank === 2) return { backgroundColor: "#c0c0c0", color: "#4a4a4a" };
    if (rank === 3) return { backgroundColor: "#cd7f32", color: "#ffffff" };
    return { backgroundColor: "#e2e8f0", color: "#4a5568" };
  };

  const sortedBooks = [...books].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'rank':
        comparison = a.rank - b.rank;
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'pages':
        comparison = a.page_length - b.page_length;
        break;
      case 'read_count':
        comparison = a.read_count - b.read_count;
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "24px",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    innerContainer: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      textAlign: "center" as const,
      marginBottom: "40px",
      color: "white",
    },
    title: {
      fontSize: "48px",
      fontWeight: "700",
      margin: "0 0 12px 0",
      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
    },
    subtitle: {
      fontSize: "20px",
      fontWeight: "300",
      margin: 0,
      opacity: 0.9,
    },
    controlsContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "32px",
      flexWrap: "wrap" as const,
      gap: "16px",
    },
    yearContainer: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    sortContainer: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    label: {
      color: "white",
      fontSize: "14px",
      fontWeight: "500",
    },
    select: {
      padding: "8px 12px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      fontSize: "14px",
      cursor: "pointer",
      minWidth: "100px",
    },
    emptyState: {
      textAlign: "center" as const,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: "24px",
      padding: "60px 40px",
      maxWidth: "500px",
      margin: "0 auto",
      boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
    },
    emptyIcon: {
      fontSize: "80px",
      marginBottom: "24px",
    },
    emptyTitle: {
      fontSize: "28px",
      fontWeight: "600",
      color: "#2d3748",
      marginBottom: "16px",
    },
    emptyText: {
      fontSize: "16px",
      color: "#718096",
      lineHeight: 1.6,
    },
    booksGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
      gap: "24px",
    },
    bookCard: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: "20px",
      padding: "24px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      transition: "all 0.3s ease",
      cursor: "default",
      position: "relative" as const,
    },
    rankBadge: {
      position: "absolute" as const,
      top: "16px",
      right: "16px",
      padding: "8px 12px",
      borderRadius: "20px",
      fontSize: "14px",
      fontWeight: "700",
      minWidth: "40px",
      textAlign: "center" as const,
    },
    bookHeader: {
      marginBottom: "20px",
      paddingRight: "60px",
    },
    bookTitle: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#2d3748",
      marginBottom: "12px",
      lineHeight: 1.3,
    },
    bookMeta: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "8px",
      marginBottom: "16px",
    },
    metaRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
      color: "#4a5568",
    },
    badge: {
      backgroundColor: "#e6fffa",
      color: "#234e52",
      padding: "4px 8px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "600",
      border: "1px solid #b2f5ea",
    },
    readCountBadge: {
      backgroundColor: "#fed7d7",
      color: "#822727",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "14px",
      fontWeight: "700",
      border: "1px solid #feb2b2",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
    },
    authorsPublishers: {
      borderTop: "1px solid #e2e8f0",
      paddingTop: "16px",
      fontSize: "13px",
      color: "#718096",
    },
    authorsRow: {
      marginBottom: "8px",
    },
    publishersRow: {
      marginBottom: "0",
    },
    loadingSpinner: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px",
    },
    spinner: {
      width: "40px",
      height: "40px",
      border: "4px solid rgba(255, 255, 255, 0.3)",
      borderTop: "4px solid white",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    statsContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: "16px",
      padding: "20px",
      marginBottom: "32px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    statsTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#2d3748",
      marginBottom: "16px",
      textAlign: "center" as const,
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "16px",
      textAlign: "center" as const,
    },
    statItem: {
      padding: "12px",
      backgroundColor: "#f7fafc",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
    },
    statNumber: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#3182ce",
      marginBottom: "4px",
    },
    statLabel: {
      fontSize: "12px",
      color: "#718096",
      fontWeight: "500",
    },
  };

  const totalBooks = books.length;
  const totalReads = books.reduce((sum, book) => sum + book.read_count, 0);
  const avgReads = totalBooks > 0 ? Math.round(totalReads / totalBooks) : 0;
  const topBook = books.find(book => book.rank === 1);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏆 Global Rankings</h1>
          <p style={styles.subtitle}>Most popular books by year</p>
        </div>

        <div style={styles.controlsContainer}>
          <div style={styles.yearContainer}>
            <span style={styles.label}>Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={styles.select}
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {books.length > 0 && (
            <div style={styles.sortContainer}>
              <span style={styles.label}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rank' | 'title' | 'pages' | 'read_count')}
                style={styles.select}
              >
                <option value="rank">Rank</option>
                <option value="read_count">Read Count</option>
                <option value="title">Title</option>
                <option value="pages">Page Count</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                style={styles.select}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          )}
        </div>

        {books.length > 0 && (
          <div style={styles.statsContainer}>
            <h3 style={styles.statsTitle}>📊 {selectedYear} Reading Statistics</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>{totalBooks}</div>
                <div style={styles.statLabel}>Unique Books</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>{totalReads}</div>
                <div style={styles.statLabel}>Total Reads</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>{avgReads}</div>
                <div style={styles.statLabel}>Avg Reads/Book</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>{topBook ? topBook.read_count : 0}</div>
                <div style={styles.statLabel}>Most Popular</div>
              </div>
            </div>
          </div>
        )}

        {books.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📚</div>
            <h3 style={styles.emptyTitle}>No Books Read in {selectedYear}</h3>
            <p style={styles.emptyText}>
              No books were marked as read by any users in {selectedYear}. 
              Try selecting a different year or check back once users start reading!
            </p>
          </div>
        ) : (
          <div style={styles.booksGrid}>
            {sortedBooks.map((book) => (
              <div
                key={book.book_id}
                style={styles.bookCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
                }}
              >
                <div 
                  style={{
                    ...styles.rankBadge,
                    ...getRankStyle(book.rank)
                  }}
                >
                  {getRankDisplay(book.rank)}
                </div>

                <div style={styles.bookHeader}>
                  <h3 style={styles.bookTitle}>{book.title}</h3>
                  {book.issue && (
                    <div style={styles.badge}>{book.issue}</div>
                  )}
                </div>

                <div style={styles.bookMeta}>
                  <div style={styles.metaRow}>
                    <span>👥</span>
                    <div style={styles.readCountBadge}>
                      {book.read_count} reader{book.read_count !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  {book.page_length && (
                    <div style={styles.metaRow}>
                      <span>📄</span>
                      <span>{book.page_length} pages</span>
                    </div>
                  )}
                </div>

                <div style={styles.authorsPublishers}>
                  {book.authors && book.authors.length > 0 && (
                    <div style={styles.authorsRow}>
                      <strong>Authors:</strong> {book.authors.join(', ')}
                    </div>
                  )}
                  {book.publishers && book.publishers.length > 0 && (
                    <div style={styles.publishersRow}>
                      <strong>Publishers:</strong> {book.publishers.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}