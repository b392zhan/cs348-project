import { useEffect, useState } from "react";

interface FeedItem {
  hasread_id: number;
  user_id: number;
  username: string;
  name: string;
  book_id: number;
  book_title: string;
  cover_url: string | null;
  date: string;
  review: string | null;
  page_length: number | null;
}

export default function Feed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    const currentUserId = localStorage.getItem("user_id");
    if (!currentUserId) {
      setError("Please log in to view your feed");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/feed?user_id=${currentUserId}`);
      const data = await res.json();

      if (data.status === "success") {
        setFeedItems(data.feed || []);
        setError(null);
      } else {
        setError(data.message || "Failed to load feed");
        setFeedItems([]);
      }
    } catch (err) {
      console.error("Failed to fetch feed:", err);
      setError("Failed to load feed. Please try again.");
      setFeedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: "2rem", 
        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", 
        minHeight: "100vh", 
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Loading your feed...</div>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            border: "4px solid rgba(255,255,255,0.3)", 
            borderTop: "4px solid #fff", 
            borderRadius: "50%", 
            animation: "spin 1s linear infinite",
            margin: "0 auto"
          }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: "2rem", 
        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", 
        minHeight: "100vh", 
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ 
          textAlign: "center", 
          background: "rgba(220, 38, 38, 0.9)", 
          padding: "2rem", 
          borderRadius: "10px",
          maxWidth: "400px",
          backdropFilter: "blur(10px)"
        }}>
          <h3 style={{ marginBottom: "1rem" }}>Error</h3>
          <p>{error}</p>
          <button 
            onClick={fetchFeed}
            style={{
              backgroundColor: "#fff",
              color: "#1e3a8a",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              marginTop: "1rem",
              fontWeight: "bold"
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", minHeight: "100vh", color: "#fff" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem", textAlign: "center" }}>
          📚 Your Reading Feed
        </h1>
        <p style={{ 
          textAlign: "center", 
          color: "rgba(255,255,255,0.8)", 
          marginBottom: "2rem",
          fontSize: "1.1rem"
        }}>
          See what books your friends have been reading lately
        </p>

        {feedItems.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            background: "rgba(255,255,255,0.1)", 
            padding: "3rem", 
            borderRadius: "15px",
            margin: "2rem 0",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📖</div>
            <h3 style={{ marginBottom: "1rem", color: "#fff" }}>No reading activity yet</h3>
            <p style={{ color: "rgba(255,255,255,0.8)", lineHeight: "1.6" }}>
              Your feed is empty! This could mean:<br/>
              • You're not following anyone yet<br/>
              • People you follow haven't read any books recently<br/>
              • Start following readers to see their activity here
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {feedItems.map((item) => (
              <div
                key={item.hasread_id}
                style={{
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: "15px",
                  padding: "1.5rem",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  backdropFilter: "blur(10px)",
                  color: "#1e3a8a"
                }}
              >
                <div style={{ display: "flex", gap: "1rem" }}>
                  {/* Book Cover */}
                  <div style={{ flexShrink: 0 }}>
                    {item.cover_url ? (
                      <img
                        src={item.cover_url}
                        alt={item.book_title}
                        style={{
                          width: "80px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "2px solid #3b82f6"
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "80px",
                          height: "120px",
                          background: "#e5e7eb",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "2rem",
                          border: "2px solid #3b82f6"
                        }}
                      >
                        📚
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* User info and date */}
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      marginBottom: "0.75rem",
                      flexWrap: "wrap",
                      gap: "0.5rem"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "#1e3a8a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1rem",
                            fontWeight: "bold",
                            color: "#fff"
                          }}
                        >
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: "bold", fontSize: "1rem" }}>
                            {item.name}
                          </div>
                          <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
                            @{item.username}
                          </div>
                        </div>
                      </div>
                      <div style={{ 
                        color: "#64748b", 
                        fontSize: "0.9rem",
                        background: "#e2e8f0",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px"
                      }}>
                        {formatDate(item.date)}
                      </div>
                    </div>

                    {/* Book info */}
                    <div style={{ marginBottom: "1rem" }}>
                      <h3 style={{ 
                        fontSize: "1.3rem", 
                        marginBottom: "0.5rem",
                        color: "#1e3a8a",
                        lineHeight: "1.3",
                        fontWeight: "bold"
                      }}>
                        📖 {item.book_title}
                      </h3>
                      <div style={{ 
                        display: "flex", 
                        gap: "1rem", 
                        fontSize: "0.9rem", 
                        color: "#64748b",
                        flexWrap: "wrap"
                      }}>
                        <span>Book ID: {item.book_id}</span>
                        {item.page_length && (
                          <span>📄 {item.page_length} pages</span>
                        )}
                      </div>
                    </div>

                    {/* Review */}
                    {item.review && (
                      <div style={{
                        background: "#f1f5f9",
                        padding: "1rem",
                        borderRadius: "8px",
                        borderLeft: "4px solid #3b82f6"
                      }}>
                        <div style={{ 
                          fontSize: "0.9rem", 
                          color: "#64748b", 
                          marginBottom: "0.5rem",
                          fontWeight: "bold"
                        }}>
                          💭 Review:
                        </div>
                        <div style={{ 
                          lineHeight: "1.5",
                          color: "#1e3a8a"
                        }}>
                          {item.review}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh button */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            onClick={fetchFeed}
            style={{
              backgroundColor: "#fff",
              color: "#1e3a8a",
              padding: "0.75rem 2rem",
              borderRadius: "25px",
              border: "2px solid #3b82f6",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              margin: "0 auto",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              transition: "all 0.3s ease"
            }}
          >
            🔄 Refresh Feed
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}