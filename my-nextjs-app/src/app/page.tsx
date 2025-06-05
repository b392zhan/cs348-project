'use client'; 

import { useEffect, useState } from "react";

function Home() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:5000/api/hello")
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage("Failed to fetch"));
  }, []);

  return (
    <main>
      <h1>Flask says:</h1>
      <p>{message}</p>
    </main>
  );
}

export default function Component() {
  const [activeFilter, setActiveFilter] = useState("H")
  const [activeNavItem, setActiveNavItem] = useState("Library")

  const navItems = [
    "Library",
    "My Collection",
    "Wish List",
    "Table 3",
    "Table 4",
    "Configurations",
    "Support",
    "Settings",
  ]

  const alphabetFilters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "ALL",
  ]

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      display: "flex",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    sidebar: {
      width: "200px",
      backgroundColor: "#eeeeef",
      borderRight: "1px solid #dedede",
      display: "flex",
      flexDirection: "column" as const,
    },
    logo: {
      padding: "24px",
    },
    logoText: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#03151e",
      margin: 0,
    },
    nav: {
      flex: 1,
      padding: "0 16px",
    },
    navButton: {
      width: "100%",
      textAlign: "left" as const,
      padding: "8px 12px",
      borderRadius: "6px",
      marginBottom: "4px",
      fontSize: "14px",
      border: "none",
      cursor: "pointer",
      transition: "all 0.2s",
      backgroundColor: "transparent",
    },
    navButtonActive: {
      backgroundColor: "#4bc1d2",
      color: "white",
    },
    navButtonInactive: {
      color: "#666666",
    },
    mainContent: {
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
    },
    header: {
      backgroundColor: "#ffffff",
      borderBottom: "1px solid #dedede",
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    searchContainer: {
      position: "relative" as const,
      flex: 1,
      maxWidth: "400px",
    },
    searchInput: {
      width: "100%",
      padding: "8px 12px 8px 40px",
      border: "1px solid #bbbbbb",
      borderRadius: "6px",
      backgroundColor: "#f6f6f6",
      fontSize: "14px",
      outline: "none",
    },
    searchIcon: {
      position: "absolute" as const,
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#8a8a8a",
    },
    userSection: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    userText: {
      fontSize: "14px",
      color: "#666666",
    },
    userSubText: {
      fontSize: "12px",
      color: "#8a8a8a",
    },
    avatar: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      backgroundColor: "#4bc1d2",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "12px",
      fontWeight: "bold",
    },
    content: {
      flex: 1,
      padding: "24px",
    },
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "24px",
    },
    sectionTitle: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    title: {
      fontSize: "32px",
      fontWeight: "600",
      color: "#03151e",
      margin: 0,
    },
    pagination: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    pageNumber: {
      width: "24px",
      height: "24px",
      backgroundColor: "#ececec",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      color: "#666666",
    },
    controls: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    button: {
      padding: "8px 16px",
      border: "1px solid #bbbbbb",
      borderRadius: "6px",
      backgroundColor: "white",
      cursor: "pointer",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.2s",
    },
    primaryButton: {
      backgroundColor: "#4bc1d2",
      color: "white",
      border: "1px solid #4bc1d2",
    },
    bookSearchContainer: {
      position: "relative" as const,
      marginBottom: "24px",
      maxWidth: "600px",
    },
    bookSearchInput: {
      width: "100%",
      padding: "12px 16px 12px 48px",
      border: "1px solid #bbbbbb",
      borderRadius: "6px",
      backgroundColor: "#f6f6f6",
      fontSize: "16px",
      outline: "none",
    },
    alphabetFilter: {
      display: "flex",
      flexWrap: "wrap" as const,
      gap: "8px",
      marginBottom: "32px",
    },
    filterButton: {
      padding: "4px 12px",
      fontSize: "14px",
      border: "none",
      backgroundColor: "transparent",
      cursor: "pointer",
      transition: "color 0.2s",
    },
    filterButtonActive: {
      color: "#4bc1d2",
      fontWeight: "500",
    },
    filterButtonInactive: {
      color: "#666666",
    },
    activeLetterSection: {
      marginBottom: "24px",
    },
    activeLetter: {
      fontSize: "48px",
      fontWeight: "300",
      color: "#4bc1d2",
      margin: "0 0 24px 0",
    },
    bookGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
      gap: "24px",
    },
    bookCard: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
    },
    bookCover: {
      width: "128px",
      height: "192px",
      marginBottom: "12px",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    bookImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover" as const,
    },
    bookInfo: {
      textAlign: "center" as const,
    },
    bookTitle: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#03151e",
      margin: "0 0 4px 0",
      lineHeight: "1.3",
    },
    bookAuthor: {
      fontSize: "12px",
      color: "#8a8a8a",
      margin: 0,
    },
    fab: {
      position: "fixed" as const,
      bottom: "32px",
      right: "32px",
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      backgroundColor: "#4bc1d2",
      border: "none",
      cursor: "pointer",
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "24px",
      transition: "all 0.2s",
    },
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <h1 style={styles.logoText}>SHELFIE</h1>
          <Home/>   
          {/* Connect to Flask test above */}
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveNavItem(item)}
              style={{
                ...styles.navButton,
                ...(activeNavItem === item ? styles.navButtonActive : styles.navButtonInactive),
              }}
              onMouseEnter={(e) => {
                if (activeNavItem !== item) {
                  e.currentTarget.style.backgroundColor = "#dedede"
                }
              }}
              onMouseLeave={(e) => {
                if (activeNavItem !== item) {
                  e.currentTarget.style.backgroundColor = "transparent"
                }
              }}
            >
              {item === "Library" && activeNavItem === item && <span style={{ marginRight: "8px" }}>→</span>}
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.searchContainer}>
            <div style={styles.searchIcon}>🔍</div>
            <input type="text" placeholder="Search" style={styles.searchInput} />
          </div>

          <div style={styles.userSection}>
            <span style={styles.userText}>User</span>
            <span style={styles.userSubText}>Account Menu</span>
            <div style={styles.avatar}>U</div>
          </div>
        </header>

        {/* Content Area */}
        <div style={styles.content}>
          {/* Section Header */}
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitle}>
              <h2 style={styles.title}>Harry Potter</h2>
              <div style={styles.pagination}>
                <span style={styles.pageNumber}>1</span>
                <span style={{ color: "#8a8a8a" }}>›</span>
              </div>
            </div>

            <div style={styles.controls}>
              <button style={styles.button}>
                <span>⊞</span>
                Display
              </button>
              <button style={styles.button}>
                Title
                <span>›</span>
              </button>
              <button style={{ ...styles.button, ...styles.primaryButton }}>
                <span>⚙</span>
                Filter
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={styles.bookSearchContainer}>
            <div style={styles.searchIcon}>🔍</div>
            <input type="text" placeholder="Search book title" style={styles.bookSearchInput} />
          </div>

          {/* Alphabet Filter */}
          <div style={styles.alphabetFilter}>
            {alphabetFilters.map((letter) => (
              <button
                key={letter}
                onClick={() => setActiveFilter(letter)}
                style={{
                  ...styles.filterButton,
                  ...(activeFilter === letter ? styles.filterButtonActive : styles.filterButtonInactive),
                }}
                onMouseEnter={(e) => {
                  if (activeFilter !== letter) {
                    e.currentTarget.style.color = "#03151e"
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeFilter !== letter) {
                    e.currentTarget.style.color = "#666666"
                  }
                }}
              >
                {letter}
              </button>
            ))}
          </div>

          {/* Active Letter Display */}
          <div style={styles.activeLetterSection}>
            <h3 style={styles.activeLetter}>H</h3>
          </div>

          {/* Book Grid */}
          <div style={styles.bookGrid}>
            <div style={styles.bookCard}>
              <div style={styles.bookCover}>
                <img
                  src="/placeholder.svg?height=192&width=128"
                  alt="Harry Potter and The Cursed Child"
                  style={styles.bookImage}
                />
              </div>
              <div style={styles.bookInfo}>
                <h4 style={styles.bookTitle}>Harry Potter and The Cursed Child</h4>
                <p style={styles.bookAuthor}>J.K. Rowling</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        style={styles.fab}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#3da8b7"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#4bc1d2"
        }}
      >
        +
      </button>
    </div>
  )
}

