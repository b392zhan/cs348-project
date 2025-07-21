'use client';

import { useEffect, useState } from 'react';

interface MostReadBook {
  book_id: number;
  title: string;
  read_count: number;
}

interface ApiResponse {
  book: MostReadBook | null;
  year: number;
  message?: string;
}

export default function MostReadBookPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    const fetchMostReadBook = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/most-read-book?year=${selectedYear}`);
        const responseData = await res.json();
        setData(responseData);
      } catch (error) {
        console.error('Error fetching most read book:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMostReadBook();
  }, [selectedYear]);

  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/most-read-book/available-years`);
        const yearData = await res.json();
        setAvailableYears(yearData.years || []);
      } catch (error) {
        console.error('Error fetching available years:', error);
        const currentYear = new Date().getFullYear();
        setAvailableYears([currentYear, currentYear - 1, currentYear - 2, currentYear - 3]);
      }
    };

    fetchAvailableYears();
  }, []);

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)",
      padding: "24px",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    innerContainer: {
      maxWidth: "600px",
      width: "100%",
      textAlign: "center" as const,
    },
    header: {
      marginBottom: "32px",
    },
    headerIcon: {
      fontSize: "64px",
      marginBottom: "16px",
    },
    title: {
      fontSize: "36px",
      fontWeight: "700",
      color: "white",
      margin: "0 0 16px 0",
      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
    },
    subtitle: {
      fontSize: "18px",
      fontWeight: "300",
      color: "rgba(255, 255, 255, 0.9)",
      margin: 0,
      lineHeight: 1.5,
    },
    controlsContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: "32px",
      gap: "12px",
    },
    label: {
      color: "white",
      fontSize: "18px",
      fontWeight: "500",
    },
    select: {
      padding: "12px 20px",
      borderRadius: "12px",
      border: "none",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      fontSize: "16px",
      cursor: "pointer",
      minWidth: "140px",
      fontWeight: "500",
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    },
    bookCard: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: "24px",
      padding: "40px 30px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
      position: "relative" as const,
    },
    crownBadge: {
      position: "absolute" as const,
      top: "-20px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
      color: "#92400e",
      padding: "16px 24px",
      borderRadius: "20px",
      fontSize: "20px",
      fontWeight: "700",
      boxShadow: "0 8px 24px rgba(251, 191, 36, 0.4)",
      border: "2px solid #fcd34d",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    bookTitle: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: "24px",
      lineHeight: 1.3,
      marginTop: "20px",
    },
    readCount: {
      fontSize: "64px",
      fontWeight: "700",
      color: "#3b82f6",
      margin: "0 0 8px 0",
    },
    readLabel: {
      fontSize: "18px",
      fontWeight: "500",
      color: "#6b7280",
    },
    yearLabel: {
      fontSize: "16px",
      fontWeight: "500",
      color: "#9ca3af",
      marginTop: "24px",
    },
    emptyState: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: "24px",
      padding: "40px 30px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
    },
    emptyIcon: {
      fontSize: "48px",
      marginBottom: "24px",
    },
    emptyTitle: {
      fontSize: "24px",
      fontWeight: "600",
      color: "#2d3748",
      marginBottom: "16px",
    },
    emptyText: {
      fontSize: "16px",
      color: "#718096",
      lineHeight: 1.6,
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column" as const,
    },
    spinner: {
      width: "48px",
      height: "48px",
      border: "4px solid rgba(255, 255, 255, 0.3)",
      borderTop: "4px solid white",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      marginBottom: "16px",
    },
    loadingText: {
      fontSize: "18px",
      fontWeight: "600",
      color: "white",
      marginBottom: "8px",
    },
    loadingSubtext: {
      fontSize: "14px",
      color: "rgba(255, 255, 255, 0.8)",
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.innerContainer}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <div style={styles.loadingText}>Finding Most Read Book...</div>
            <div style={styles.loadingSubtext}>Analyzing reading patterns for {selectedYear}</div>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        <div style={styles.header}>
          <div style={styles.headerIcon}>👑</div>
          <h1 style={styles.title}>Most Read Book</h1>
          <p style={styles.subtitle}>Discover the year's reading champion</p>
        </div>

        <div style={styles.controlsContainer}>
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

        {!data || !data.book ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📚</div>
            <h3 style={styles.emptyTitle}>No Books Read in {selectedYear}</h3>
            <p style={styles.emptyText}>
              {data?.message || `No books were marked as read in ${selectedYear}. Try selecting a different year!`}
            </p>
          </div>
        ) : (
          <div style={styles.bookCard}>
            <div style={styles.crownBadge}>
              <span>🏆</span>
              <span>#1 Read Book of {selectedYear}</span>
            </div>

            <h2 style={styles.bookTitle}>{data.book.title}</h2>
            
            <div style={styles.readCount}>{data.book.read_count}</div>
            <div style={styles.readLabel}>times read</div>
            
            <div style={styles.yearLabel}>Year: {selectedYear}</div>
          </div>
        )}
      </div>
    </div>
  );
}