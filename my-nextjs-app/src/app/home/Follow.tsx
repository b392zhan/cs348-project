import { useEffect, useState } from "react";

interface User {
  user_id: number;
  username: string;
  name: string;
  isFollowing: boolean;
}

export default function Follow() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchFollowingUsers();
  }, []);

  const fetchFollowingUsers = async () => {
    const currentUserId = localStorage.getItem("user_id");
    if (!currentUserId) return;

    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/users-to-follow?user_id=${currentUserId}`);
      const data = await res.json();

      if (data.status === "success") {
        setUsers(data.users || []);
      } else {
        console.error("Error:", data.message);
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to fetch users.", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const currentUserId = localStorage.getItem("user_id");
    if (!currentUserId) return;

    setSearchLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/search-users?query=${encodeURIComponent(searchQuery)}&current_user_id=${currentUserId}`);
      const data = await res.json();

      if (data.status === "success") {
        setSearchResults(data.users || []);
      } else {
        console.error("Search error:", data.message);
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFollow = async (targetUserId: number) => {
    const currentUserId = localStorage.getItem("user_id");
    if (!currentUserId) return;

    try {
      const res = await fetch("http://127.0.0.1:5000/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          follower_id: Number(currentUserId),
          followee_id: targetUserId,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        // Update both lists
        setUsers((prev) =>
          prev.map((user) =>
            user.user_id === targetUserId ? { ...user, isFollowing: true } : user
          )
        );
        setSearchResults((prev) =>
          prev.map((user) =>
            user.user_id === targetUserId ? { ...user, isFollowing: true } : user
          )
        );
      } else {
        console.error("Failed to follow user:", data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error("Follow request failed:", error);
      alert("Failed to follow user. Please try again.");
    }
  };

  const handleUnfollow = async (targetUserId: number) => {
    const currentUserId = localStorage.getItem("user_id");
    if (!currentUserId) return;

    try {
      const res = await fetch("http://127.0.0.1:5000/api/unfollow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          follower_id: Number(currentUserId),
          followee_id: targetUserId,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        // Update both lists
        setUsers((prev) =>
          prev.map((user) =>
            user.user_id === targetUserId ? { ...user, isFollowing: false } : user
          )
        );
        setSearchResults((prev) =>
          prev.map((user) =>
            user.user_id === targetUserId ? { ...user, isFollowing: false } : user
          )
        );
      } else {
        console.error("Failed to unfollow user:", data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error("Unfollow request failed:", error);
      alert("Failed to unfollow user. Please try again.");
    }
  };

  const UserCard = ({ user }: { user: User }) => (
    <li
      key={user.user_id}
      style={{
        background: "rgba(255,255,255,0.95)",
        padding: "1.5rem",
        marginBottom: "1rem",
        borderRadius: "12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        border: "1px solid rgba(255,255,255,0.3)",
        backdropFilter: "blur(10px)",
        color: "#1e3a8a"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "#1e3a8a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: "#fff"
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#1e3a8a" }}>
            {user.name}
          </div>
          <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
            @{user.username}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
            ID: {user.user_id}
          </div>
        </div>
      </div>
      <button
        onClick={() => user.isFollowing ? handleUnfollow(user.user_id) : handleFollow(user.user_id)}
        style={{
          backgroundColor: user.isFollowing ? "#dc2626" : "#3b82f6",
          color: "white",
          padding: "0.75rem 1.5rem",
          borderRadius: "25px",
          border: "none",
          cursor: "pointer",
          minWidth: "120px",
          fontWeight: "bold",
          fontSize: "0.9rem",
          boxShadow: user.isFollowing ? "0 2px 8px rgba(220, 38, 38, 0.3)" : "0 2px 8px rgba(59, 130, 246, 0.3)",
          transition: "all 0.3s ease"
        }}
      >
        {user.isFollowing ? "Unfollow" : "Follow"}
      </button>
    </li>
  );

  return (
    <div style={{ 
      padding: "2rem", 
      background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", 
      minHeight: "100vh", 
      color: "#fff" 
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ 
          fontSize: "2.5rem", 
          marginBottom: "0.5rem", 
          textAlign: "center",
          fontWeight: "bold" 
        }}>
          👥 Find and Follow Users
        </h2>
        <p style={{ 
          textAlign: "center", 
          color: "rgba(255,255,255,0.8)", 
          marginBottom: "2rem",
          fontSize: "1.1rem"
        }}>
          Connect with fellow readers and book enthusiasts
        </p>
        
        {/* Search Section */}
        <div style={{ 
          marginBottom: "3rem",
          background: "rgba(255,255,255,0.1)",
          padding: "2rem",
          borderRadius: "15px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.2)"
        }}>
          <h3 style={{ 
            fontSize: "1.3rem", 
            marginBottom: "1.5rem", 
            color: "#fff",
            fontWeight: "bold"
          }}>
            🔍 Search Users
          </h3>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="Search by username or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchUsers()}
              style={{
                flex: 1,
                padding: "1rem",
                borderRadius: "12px",
                border: "2px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.9)",
                color: "#1e3a8a",
                fontSize: "1rem",
                fontWeight: "500"
              }}
            />
            <button
              onClick={searchUsers}
              disabled={searchLoading}
              style={{
                backgroundColor: "#fff",
                color: "#1e3a8a",
                padding: "1rem 2rem",
                borderRadius: "12px",
                border: "2px solid #3b82f6",
                cursor: searchLoading ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(255,255,255,0.3)",
                opacity: searchLoading ? 0.7 : 1
              }}
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <h4 style={{ 
                fontSize: "1.2rem", 
                marginBottom: "1rem", 
                color: "#fff",
                fontWeight: "bold"
              }}>
                📋 Search Results
              </h4>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: "1rem" }}>
                {searchResults.map((user) => (
                  <UserCard key={`search-${user.user_id}`} user={user} />
                ))}
              </ul>
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !searchLoading && (
            <div style={{ 
              color: "rgba(255,255,255,0.8)", 
              marginTop: "1rem",
              textAlign: "center",
              fontSize: "1rem"
            }}>
              No users found matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Suggested Users Section */}
        <div style={{
          background: "rgba(255,255,255,0.1)",
          padding: "2rem",
          borderRadius: "15px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.2)"
        }}>
          <h3 style={{ 
            fontSize: "1.3rem", 
            marginBottom: "1.5rem", 
            color: "#fff",
            fontWeight: "bold"
          }}>
            ✨ Suggested Users
          </h3>
          {loading ? (
            <div style={{ 
              textAlign: "center", 
              padding: "2rem",
              color: "rgba(255,255,255,0.8)",
              fontSize: "1.1rem"
            }}>
              <div style={{ 
                width: "40px", 
                height: "40px", 
                border: "4px solid rgba(255,255,255,0.3)", 
                borderTop: "4px solid #fff", 
                borderRadius: "50%", 
                animation: "spin 1s linear infinite",
                margin: "0 auto 1rem"
              }}></div>
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div style={{ 
              color: "rgba(255,255,255,0.8)",
              textAlign: "center",
              padding: "2rem",
              fontSize: "1rem"
            }}>
              No suggested users available.
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {users.map((user) => (
                <UserCard key={`suggested-${user.user_id}`} user={user} />
              ))}
            </ul>
          )}
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