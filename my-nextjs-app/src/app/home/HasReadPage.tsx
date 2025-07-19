'use client';

import { useEffect, useState } from 'react';

interface Book {
  book_id: number;
  title: string;
  issue: string;
  page_length: number;
  review: string;
  date: string;
}

export default function HasReadPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'pages'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchHasReadBooks = async () => {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://127.0.0.1:5000/api/hasread?username=${user_id}`);
        const data = await res.json();
        setBooks(data);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHasReadBooks();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const sortedBooks = [...books].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'pages':
        comparison = a.page_length - b.page_length;
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
    sortContainer: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    sortLabel: {
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
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
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
    },
    bookHeader: {
      marginBottom: "20px",
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
      alignItems: "center",
      gap: "16px",
      marginBottom: "16px",
    },
    badge: {
      backgroundColor: "#e6fffa",
      color: "#234e52",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      border: "1px solid #b2f5ea",
    },
    dateCompleted: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
      color: "#4a5568",
      marginBottom: "16px",
    },
    reviewSection: {
      borderTop: "1px solid #e2e8f0",
      paddingTop: "16px",
    },
    reviewLabel: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#2d3748",
      marginBottom: "8px",
    },
    reviewText: {
      backgroundColor: "#f7fafc",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "14px",
      color: "#4a5568",
      lineHeight: 1.5,
      border: "1px solid #e2e8f0",
      fontStyle: "italic",
      minHeight: "60px",
      display: "flex",
      alignItems: "center",
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
  };

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
          <h1 style={styles.title}>📚 Reading Journey</h1>
          <p style={styles.subtitle}>Your completed books and reviews</p>
        </div>

        {books.length > 0 && (
          <div style={styles.controlsContainer}>
            <div style={styles.sortContainer}>
              <span style={styles.sortLabel}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'pages')}
                style={styles.select}
              >
                <option value="date">Date Read</option>
                <option value="title">Title</option>
                <option value="pages">Page Count</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                style={styles.select}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        )}

        {books.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📖</div>
            <h3 style={styles.emptyTitle}>No Books Read Yet</h3>
            <p style={styles.emptyText}>
              Start your reading journey by marking books as read from your library. 
              Your completed books and reviews will appear here.
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
                <div style={styles.bookHeader}>
                  <h3 style={styles.bookTitle}>{book.title}</h3>
                  <div style={styles.dateCompleted}>
                    <span>📅</span>
                    <span>Completed on {formatDate(book.date)}</span>
                  </div>
                </div>

                <div style={styles.reviewSection}>
                  <div style={styles.reviewLabel}>Your Review:</div>
                  <div style={styles.reviewText}>
                    {book.review || "No review added yet"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}