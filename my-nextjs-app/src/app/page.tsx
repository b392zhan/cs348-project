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
  const [showAddBookModal, setShowAddBookModal] = useState(false)
  const [books, setBooks] = useState([
    {
      id: 1,
      title: "Harry Potter and The Cursed Child",
      author: "J.K. Rowling",
      coverUrl: "/placeholder.svg?height=192&width=128",
      letter: "H",
    },
  ])
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    authorDob: "",
    issue: "",
    pageLength: "",
    coverUrl: "",
  });
  

  const navItems = [
    "Library",
    "My Collection",
    "Wish List",
    "Table 1",
    "Table 2",
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

  const handleAddBook = async (e) => {
    e.preventDefault();
  
    const firstLetter = newBook.title.charAt(0).toUpperCase();
  
    const bookToAdd = {
      id: books.length + 1,
      title: newBook.title,
      author: newBook.author,
      coverUrl: newBook.coverUrl || "/placeholder.svg?height=192&width=128",
      letter: firstLetter,
    };
  
    try {
      const response = await fetch("http://127.0.0.1:5000/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newBook.title,
          issue: newBook.issue,
          page_length: parseInt(newBook.pageLength),
          author: newBook.author,
          author_dob: newBook.authorDob,
          cover_url: newBook.coverUrl, // sent for future use
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to send book to backend:", errorData);
      } else {
        const responseData = await response.json();
        console.log("✅ Book sent to backend:", responseData);
      }
    } catch (error) {
      console.error("❌ Error sending book to backend:", error);
    }
  
    setBooks([...books, bookToAdd]);
  
    setNewBook({
      title: "",
      author: "",
      authorDob: "",
      issue: "",
      pageLength: "",
      coverUrl: "/placeholder.svg?height=192&width=128",
    });
  
    setShowAddBookModal(false);
  };
  


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
      zIndex: 10,
    },
    // Modal styles
    modalOverlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
    },
    modalContainer: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
      width: "90%",
      maxWidth: "500px",
      maxHeight: "80vh", 
      overflowY: "auto",  
      padding: "16px",   
      position: "relative" as const,
    },    
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
    },
    modalTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#03151e",
      margin: 0,
    },
    closeButton: {
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: "#666666",
    },
    form: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "16px",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "8px",
    },
    label: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#03151e",
    },
    input: {
      padding: "8px 10px", 
      border: "1px solid #bbbbbb",
      borderRadius: "6px",
      fontSize: "14px",
      outline: "none",
    },
    formActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "8px", // was 12px
      marginTop: "16px", // was 24px
    },
    cancelButton: {
      padding: "8px 14px", // was 10px 16px
      border: "1px solid #bbbbbb",
      borderRadius: "6px",
      backgroundColor: "white",
      cursor: "pointer",
      fontSize: "14px",
    },
    submitButton: {
      padding: "8px 14px", // was 10px 16px
      border: "1px solid #4bc1d2",
      borderRadius: "6px",
      backgroundColor: "#4bc1d2",
      color: "white",
      cursor: "pointer",
      fontSize: "14px",
    },
    previewSection: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      marginTop: "16px",
    },
    previewTitle: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#03151e",
      marginBottom: "12px",
    },
    previewCover: {
      width: "100px",
      height: "150px",
      borderRadius: "6px",
      overflow: "hidden",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    previewImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover" as const,
    },
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <h1 style={styles.logoText}>SHELFIE</h1>
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
            <h3 style={styles.activeLetter}>{activeFilter === "ALL" ? "All Books" : activeFilter}</h3>
          </div>

          {/* Book Grid */}
          <div style={styles.bookGrid}>
            {books
              .filter((book) => {
                if (activeFilter === "ALL") return true
                return book.letter === activeFilter
              })
              .map((book) => (
                <div key={book.id} style={styles.bookCard}>
                  <div style={styles.bookCover}>
                    <img src={book.coverUrl || "/placeholder.svg"} alt={book.title} style={styles.bookImage} />
                  </div>
                  <div style={styles.bookInfo}>
                    <h4 style={styles.bookTitle}>{book.title}</h4>
                    <p style={styles.bookAuthor}>{book.author}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        style={styles.fab}
        onClick={() => setShowAddBookModal(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#3da8b7"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#4bc1d2"
        }}
      >
        +
      </button>

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddBookModal(false)}>
          <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add New Book</h3>
              <button style={styles.closeButton} onClick={() => setShowAddBookModal(false)}>
                ×
              </button>
            </div>

            <form style={styles.form} onSubmit={handleAddBook}>

              {/* Book Title */}
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="bookTitle">
                  Book Title
                </label>
                <input
                  id="bookTitle"
                  type="text"
                  style={styles.input}
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  required
                />
              </div>

              {/* Issue */}
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="bookIssue">Issue</label>
                <input
                  id="bookIssue"
                  type="text"
                  style={styles.input}
                  value={newBook.issue}
                  onChange={(e) => setNewBook({ ...newBook, issue: e.target.value })}
                  required
                />
              </div>

              {/* Page Length */}
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="pageLength">Page Length</label>
                <input
                  id="pageLength"
                  type="number"
                  style={styles.input}
                  value={newBook.pageLength}
                  onChange={(e) => setNewBook({ ...newBook, pageLength: e.target.value })}
                  required
                />
              </div>

              {/* Author Name */}
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="bookAuthor">
                  Author
                </label>
                <input
                  id="bookAuthor"
                  type="text"
                  style={styles.input}
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  required
                />
              </div>

              {/* Author DOB */}
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="authorDob">Author Date of Birth</label>
                <input
                  id="authorDob"
                  type="date"
                  style={styles.input}
                  value={newBook.authorDob}
                  onChange={(e) => setNewBook({ ...newBook, authorDob: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="coverUrl">
                  Cover Image URL (optional)
                </label>
                <input
                  id="coverUrl"
                  type="text"
                  style={styles.input}
                  value={newBook.coverUrl}
                  onChange={(e) => setNewBook({ ...newBook, coverUrl: e.target.value })}
                  placeholder="/placeholder.svg?height=192&width=128"
                />
              </div>

              {/* Preview section */}
              <div style={styles.previewSection}>
                <h4 style={styles.previewTitle}>Cover Preview</h4>
                <div style={styles.previewCover}>
                  <img
                    src={newBook.coverUrl || "/placeholder.svg?height=192&width=128"}
                    alt="Book cover preview"
                    style={styles.previewImage}
                    // onError={(e) => {
                    //   e.currentTarget.src = "/placeholder.svg?height=192&width=128"
                    //   setNewBook({ ...newBook, coverUrl: "/placeholder.svg?height=192&width=128" })
                    // }}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=192&width=128"
                    }}                    
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="button" style={styles.cancelButton} onClick={() => setShowAddBookModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
