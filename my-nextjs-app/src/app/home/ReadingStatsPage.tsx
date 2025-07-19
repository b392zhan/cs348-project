import React, { useEffect, useState } from "react";

const ReadingStatsPage = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const userId = localStorage.getItem("user_id");
      const res = await fetch(`http://127.0.0.1:5000/api/reading-stats?user_id=${userId}`);
      const data = await res.json();
      setStats(data);
    };

    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div style={{ 
        padding: "40px", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        minHeight: "60vh"
      }}>
        <div style={{
          padding: "20px 40px",
          backgroundColor: "#f8f9fa",
          borderRadius: "12px",
          fontSize: "18px",
          color: "#666"
        }}>
          📚 Loading your reading statistics...
        </div>
      </div>
    );
  }

  const statsData = [
    {
      icon: "📖",
      label: "Total Books Read",
      value: stats.total_books,
      color: "#3b82f6"
    },
    {
      icon: "📄",
      label: "Average Page Length",
      value: typeof stats.avg_pages === "number" ? `${stats.avg_pages.toFixed(1)} pages` : "N/A",
      color: "#10b981"
    },
    {
      icon: "✍️",
      label: "Favorite Author",
      value: stats.favorite_author || "N/A",
      color: "#8b5cf6"
    },
    {
      icon: "🥇",
      label: "First Book Read",
      value: stats.first_book || "N/A",
      color: "#f59e0b"
    },
    {
      icon: "📚",
      label: "Latest Read",
      value: stats.latest_book || "N/A",
      color: "#ef4444"
    }
  ];

  return (
    <div style={{ 
      padding: "40px 20px", 
      backgroundColor: "#f8fafc",
      minHeight: "100vh"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ 
          textAlign: "center", 
          marginBottom: "40px" 
        }}>
          <h1 style={{ 
            fontSize: "36px", 
            fontWeight: "700",
            color: "#1e293b",
            margin: "0 0 8px 0"
          }}>
            📊 Reading Statistics
          </h1>
          <p style={{
            fontSize: "18px",
            color: "#64748b",
            margin: "0"
          }}>
            Your personal reading journey at a glance
          </p>
        </div>

        <div style={{ 
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginBottom: "20px"
        }}>
          {statsData.map((stat, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "white",
                padding: "32px 24px",
                borderRadius: "16px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                border: "1px solid #e2e8f0",
                textAlign: "center",
                transition: "all 0.3s ease",
                cursor: "default"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
              }}
            >
              <div style={{
                fontSize: "48px",
                marginBottom: "16px",
                display: "block"
              }}>
                {stat.icon}
              </div>
              <h3 style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#64748b",
                margin: "0 0 12px 0",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                {stat.label}
              </h3>
              <div style={{
                fontSize: "28px",
                fontWeight: "700",
                color: stat.color,
                margin: "0",
                lineHeight: "1.2",
                wordBreak: "break-word"
              }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          border: "1px solid #e2e8f0",
          textAlign: "center"
        }}>
          <p style={{
            fontSize: "16px",
            color: "#64748b",
            margin: "0"
          }}>
            🎯 Keep reading to unlock more insights about your literary journey!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReadingStatsPage;