import { useEffect, useState } from "react";

interface Author {
  author_name: string;
  num_books: number;
  avg_page_length: number | string | null;
  min_book_title: string;
  min_page_length: number | string | null;
  max_book_title: string;
  max_page_length: number | string | null;
}

export default function AuthorStats() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        const res = await fetch(`http://127.0.0.1:5000/api/author-stats?username=${user_id}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setAuthors(data);
        } else {
          console.error("Unexpected API response:", data);
          setAuthors([]);
        }
      } catch (err) {
        console.error("Error fetching author stats:", err);
        setAuthors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Helper function to format page length
  const formatPageLength = (pages: number | string | null) => {
    if (pages === null || pages === undefined) return "N/A";
    
    const numPages = typeof pages === 'string' ? parseFloat(pages) : pages;
    
    if (isNaN(numPages)) return "N/A";
    
    return numPages.toFixed(1);
  };

  // Helper function to format book info
  const formatBookInfo = (title: string, pages: number | string | null) => {
    if (!title || title === "N/A") return "N/A";
    
    const numPages = typeof pages === 'string' ? parseFloat(pages) : pages;
    
    if (pages === null || pages === undefined || isNaN(numPages)) {
      return "N/A";
    }
    
    return `${title} (${numPages} pages)`;
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)",
      padding: "24px",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    innerContainer: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      textAlign: "center" as const,
      marginBottom: "48px",
      paddingTop: "24px",
    },
    headerIcon: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "80px",
      height: "80px",
      background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
      borderRadius: "24px",
      marginBottom: "24px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
      fontSize: "32px",
    },
    title: {
      fontSize: "48px",
      fontWeight: "700",
      color: "white",
      margin: "0 0 16px 0",
      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
    },
    subtitle: {
      fontSize: "20px",
      fontWeight: "300",
      color: "rgba(255, 255, 255, 0.9)",
      margin: 0,
      maxWidth: "600px",
      marginLeft: "auto",
      marginRight: "auto",
      lineHeight: 1.5,
    },
    statsOverview: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "24px",
      marginBottom: "48px",
    },
    statCard: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: "20px",
      padding: "24px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statValue: {
      fontSize: "36px",
      fontWeight: "700",
      marginBottom: "4px",
    },
    statLabel: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#6b7280",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
    },
    statIcon: {
      fontSize: "36px",
    },
    sectionTitle: {
      fontSize: "32px",
      fontWeight: "700",
      color: "white",
      textAlign: "center" as const,
      marginBottom: "32px",
      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
    },
    authorsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
      gap: "32px",
    },
    authorCard: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: "24px",
      padding: "32px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      transition: "all 0.3s ease",
      position: "relative" as const,
    },
    authorHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: "24px",
    },
    rankBadge: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "14px",
      fontWeight: "700",
      flexShrink: 0,
    },
    authorName: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#1f2937",
      lineHeight: 1.3,
      marginBottom: "8px",
      flex: 1,
      marginRight: "16px",
    },
    medalContainer: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "8px",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
      marginBottom: "24px",
    },
    miniStatCard: {
      borderRadius: "16px",
      padding: "16px",
      textAlign: "center" as const,
    },
    miniStatValue: {
      fontSize: "24px",
      fontWeight: "700",
      marginBottom: "4px",
    },
    miniStatLabel: {
      fontSize: "12px",
      fontWeight: "500",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
    },
    bookSection: {
      marginBottom: "16px",
    },
    bookSectionHeader: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "8px",
    },
    bookSectionTitle: {
      fontSize: "14px",
      fontWeight: "600",
    },
    bookInfo: {
      fontSize: "13px",
      fontWeight: "500",
      color: "#4b5563",
      lineHeight: 1.4,
      backgroundColor: "#f9fafb",
      padding: "12px",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
    },
    hoverLine: {
      position: "absolute" as const,
      bottom: 0,
      left: "32px",
      right: "32px",
      height: "4px",
      background: "linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)",
      borderRadius: "2px",
      transform: "scaleX(0)",
      transition: "transform 0.3s ease",
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
      marginBottom: "24px",
    },
    emptyButton: {
      backgroundColor: "#4f46e5",
      color: "white",
      padding: "12px 24px",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "600",
      border: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "400px",
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
    bottomDecoration: {
      textAlign: "center" as const,
      marginTop: "64px",
      paddingBottom: "48px",
    },
    decorationBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      padding: "12px 24px",
      borderRadius: "50px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      fontSize: "16px",
      fontWeight: "500",
      color: "#4b5563",
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <div style={styles.loadingText}>Loading Author Statistics...</div>
          <div style={styles.loadingSubtext}>Analyzing your reading patterns</div>
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

  if (!authors || authors.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.innerContainer}>
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📚</div>
            <h3 style={styles.emptyTitle}>No Authors Found</h3>
            <p style={styles.emptyText}>
              Start building your library to see amazing author statistics!
            </p>
            <button style={styles.emptyButton}>Add Your First Book</button>
          </div>
        </div>
      </div>
    );
  }

  const totalBooks = authors.reduce((sum, author) => sum + author.num_books, 0);
  const avgPages = Math.round(authors.reduce((sum, author) => {
    const avgPages = typeof author.avg_page_length === 'string' ? 
      parseFloat(author.avg_page_length) : author.avg_page_length;
    return sum + (avgPages || 0);
  }, 0) / authors.length);

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>


        <h2 style={styles.sectionTitle}>Your Top Authors</h2>
        
        <div style={styles.authorsGrid}>
          {authors.map((author, index) => (
            <div 
              key={index} 
              style={styles.authorCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.15)";
                const hoverLine = e.currentTarget.querySelector('.hover-line') as HTMLElement;
                if (hoverLine) hoverLine.style.transform = "scaleX(1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
                const hoverLine = e.currentTarget.querySelector('.hover-line') as HTMLElement;
                if (hoverLine) hoverLine.style.transform = "scaleX(0)";
              }}
            >
              <div style={styles.authorHeader}>
                <div style={{ flex: 1 }}>
                  <div style={styles.medalContainer}>
                    <div 
                      style={{
                        ...styles.rankBadge,
                        background: index === 0 ? "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" :
                                   index === 1 ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)" :
                                   index === 2 ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" :
                                   "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
                      }}
                    >
                      #{index + 1}
                    </div>
                    {index < 3 && (
                      <div style={{ fontSize: "24px" }}>
                        {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                      </div>
                    )}
                  </div>
                  <h3 style={styles.authorName}>{author.author_name}</h3>
                </div>
              </div>

              <div style={styles.statsGrid}>
                <div style={{
                  ...styles.miniStatCard,
                  background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)"
                }}>
                  <div style={{...styles.miniStatValue, color: "#1d4ed8"}}>{author.num_books}</div>
                  <div style={{...styles.miniStatLabel, color: "#1e40af"}}>Books Written</div>
                </div>
                <div style={{
                  ...styles.miniStatCard,
                  background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
                }}>
                  <div style={{...styles.miniStatValue, color: "#047857"}}>
                    {formatPageLength(author.avg_page_length)}
                  </div>
                  <div style={{...styles.miniStatLabel, color: "#065f46"}}>Average Pages</div>
                </div>
              </div>

              <div style={styles.bookSection}>
                <div style={styles.bookSectionHeader}>
                  <span style={{ fontSize: "18px" }}>📗</span>
                  <span style={{...styles.bookSectionTitle, color: "#f59e0b"}}>Shortest Work</span>
                </div>
                <div style={styles.bookInfo}>
                  {formatBookInfo(author.min_book_title, author.min_page_length)}
                </div>
              </div>

              <div style={styles.bookSection}>
                <div style={styles.bookSectionHeader}>
                  <span style={{ fontSize: "18px" }}>📘</span>
                  <span style={{...styles.bookSectionTitle, color: "#8b5cf6"}}>Longest Epic</span>
                </div>
                <div style={styles.bookInfo}>
                  {formatBookInfo(author.max_book_title, author.max_page_length)}
                </div>
              </div>

              <div className="hover-line" style={styles.hoverLine}></div>
            </div>
          ))}
        </div>

        <div style={styles.bottomDecoration}>
          <div style={styles.decorationBadge}>
            <span style={{ fontSize: "24px" }}>📖</span>
            <span>Keep reading to discover more insights!</span>
          </div>
        </div>
      </div>
    </div>
  );
}