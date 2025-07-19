'use client';
import React, { useEffect, useState } from "react";
import HasReadPage from './HasReadPage';
import ReadingStatsPage from './ReadingStatsPage';


type Book = {
  id: number;
  title: string;
  author: string;
  coverUrl: string;
  letter: string;
  starred?: boolean;
};

export default function Home() {
  const [message, setMessage] = useState("Loading...");
  const [books, setBooks] = useState<Book[]>([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [activeNavItem, setActiveNavItem] = useState("Library");
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showTitleFilter, setShowTitleFilter] = useState(false);
  const [showPageFilter, setShowPageFilter] = useState(false);
  const [pageRange, setPageRange] = useState({ min: "", max: "" });
  const [markingReadFor, setMarkingReadFor] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [popupVisibleFor, setPopupVisibleFor] = useState<number | null>(null);

  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    authorDob: "",
    issue: "",
    pageLength: "",
    coverUrl: "",
    publisher: "",
    starred: ""
  });

  const navItems = [
    "Library",
    "My Collection",
    "Wish List",
    "Configurations",
    "Support",
    "Settings",
    "Reading History",
    "Reading Statistics"
  ];

  const alphabetFilters = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "ALL"
  ];

  // Greeting check
  useEffect(() => {
    fetch("http://localhost:5000/api/hello")
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage("Failed to fetch"));
  }, []);

  // Fetch all books for current user
  const fetchAllBooksForUser = async () => {
    const username = localStorage.getItem("username");
    if (!username) return;

    try {
      const res = await fetch("http://127.0.0.1:5000/api/get_all_books_by_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error("❌ Error fetching all books:", error);
    }
  };

  // Filter books by starting letter
  const handleAlphabetFilter = async (letter: string) => {
    const username = localStorage.getItem("username");
    if (!username) return;

    try {
      const res = await fetch("http://127.0.0.1:5000/api/filter_books_by_letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letter, username }),
      });

      const data = await res.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error("❌ Error filtering books:", error);
    }
  };

  // Trigger fetch on active filter change
  useEffect(() => {
    if (activeFilter === "ALL") {
      fetchAllBooksForUser();
    } else {
      handleAlphabetFilter(activeFilter);
    }
  }, [activeFilter]);

  const handleAddBook = async (e: React.FormEvent) => {
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
      const user_id = localStorage.getItem('user_id');
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
          cover_url: newBook.coverUrl,
          publisher: newBook.publisher,
          user_id: user_id
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
      coverUrl: "",
      publisher: "",
      starred: ""
    });

    setShowAddBookModal(false);
  };

  const handleSearch = async () => {
    try {
      if (!searchQuery.trim()) {
        return;
      }
      const username = localStorage.getItem("user_id");

      const response = await fetch(
        `http://localhost:5000/api/books/search?query=${encodeURIComponent(searchQuery)}&username=${encodeURIComponent(username)}`
      );

      if (response.ok) {
        const data = await response.json();
        setBooks(data.books);
        setActiveFilter("ALL");
      } else {
        console.error("Search failed:", response.status);
        setBooks([]);
      }
    } catch (error) {
      console.error("Error searching books:", error);
      setBooks([]);
    }
  };

  const fetchBooks = async (query = '', sort = 'asc') => {
    try {
      const username = localStorage.getItem("user_id");
      const response = await fetch(`http://localhost:5000/api/books/sort?query=${encodeURIComponent(query)}&sort=${sort}&username=${encodeURIComponent(username)}`);
      const data = await response.json();
      if (data.status === 'success') {
        setBooks(data.books);
      } else {
        console.error('Failed to fetch books:', data);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  };

  const handlePageRangeFilter = async (min: number, max: number) => {
    try {
      const username = localStorage.getItem("user_id");
      const response = await fetch(
        `http://127.0.0.1:5000/api/books/page-range?min=${min}&max=${max}&username=${username}`
      );
      const data = await response.json();
      if (data.status === "success") {
        setBooks(data.books);
        setActiveFilter("ALL");
      }
    } catch (error) {
      console.error("❌ Error fetching books by page range:", error);
    }
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
    bookSearchContainer: {
      position: "relative" as const,
      marginBottom: "24px",
      maxWidth: "600px",
    },
    bookSearchInput: {
      width: "550px",
      padding: "12px 16px 12px 48px",
      border: "1px solid #bbbbbb",
      borderRadius: "6px",
      backgroundColor: "#f6f6f6",
      fontSize: "16px",
      outline: "none",
      color: "#333333"
    },
    searchIcon: {
      position: "absolute" as const,
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#8a8a8a",
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
      position: "relative" as const,
      backgroundColor: "#fff",
      borderRadius: "12px",
      padding: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      transition: "transform 0.2s ease",
      cursor: "pointer"
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
      overflowY: "auto" as const,
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
      gap: "8px",
      marginTop: "16px",
    },
    cancelButton: {
      padding: "8px 14px",
      border: "1px solid #bbbbbb",
      borderRadius: "6px",
      backgroundColor: "white",
      cursor: "pointer",
      fontSize: "14px",
    },
    submitButton: {
      padding: "8px 14px",
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
  };

  const popupStyle = {
    position: "absolute" as const,
    backgroundColor: "#fff",
    border: "2px solid #4bc1d2",
    borderRadius: "8px",
    padding: "16px",
    boxShadow: "0 4px 12px rgba(75,193,210,0.3)",
    zIndex: 1000,
    width: "240px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  };

  const popupInputStyle = {
    padding: "8px",
    borderRadius: "6px",
    border: "1.5px solid #4bc1d2",
    fontSize: "14px",
    outline: "none",
    color: "#333",
    backgroundColor: "#fff",
  };

  const submitBtnStyle = {
    padding: "14px",
    backgroundColor: "#4bc1d2",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "16px",
    textAlign: "center" as const,
  };

  const closeBtnStyle = {
    padding: "12px",
    backgroundColor: "#eee",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    color: "black",
    fontWeight: "600",
  };

  // Render different content based on active nav item
  // Updated renderContent function
  const renderContent = () => {
    switch (activeNavItem) {
      case "HasRead":
        return <HasReadPage />;

      case "Reading Statistics":
        return <ReadingStatsPage />;

      case "My Collection":
        return (
          <div style={styles.content}>
            <h2 style={styles.title}>My Collection</h2>
            <p>Your personal book collection will be displayed here.</p>
          </div>
        );

      case "Wish List":
        return (
          <div style={styles.content}>
            <h2 style={styles.title}>Wish List</h2>
            <p>Books you want to read will be displayed here.</p>
          </div>
        );

      case "Configurations":
        return (
          <div style={styles.content}>
            <h2 style={styles.title}>Configurations</h2>
            <p>App settings and configurations will be displayed here.</p>
          </div>
        );

      case "Support":
        return (
          <div style={styles.content}>
            <h2 style={styles.title}>Support</h2>
            <p>Support and help information will be displayed here.</p>
          </div>
        );

      case "Settings":
        return (
          <div style={styles.content}>
            <h2 style={styles.title}>Settings</h2>
            <p>User settings will be displayed here.</p>
          </div>
        );

      default: // "Library"
        return (
          <div style={styles.content}>
            {/* Section Header */}
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>
                <h2 style={styles.title}>Books</h2>
                <div style={styles.pagination}>
                  <span style={styles.pageNumber}>1</span>
                  <span style={{ color: "#8a8a8a" }}>›</span>
                </div>
              </div>
            </div>

            <div style={{
              position: 'relative',
              marginBottom: '24px',
              maxWidth: '600px'
            }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                {/* Search bar container */}
                <div style={styles.bookSearchContainer}>
                  <div style={styles.searchIcon}>🔍</div>
                  <input
                    type="text"
                    placeholder="Search book title"
                    style={styles.bookSearchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>

                {/* Filter by Title */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowTitleFilter(true)}
                    style={{
                      ...styles.button,
                      fontSize: "18px",
                      color: "black",
                      fontWeight: "600",
                      padding: "14px 24px",
                      minWidth: "150px",
                      height: "48px",
                      borderRadius: "8px",
                    }}
                  >
                    🔤 Filter by Title
                  </button>
                  {showTitleFilter && (
                    <div
                      style={{
                        ...popupStyle,
                        top: "100%",
                        left: 0,
                        marginTop: "6px",
                        width: "240px",
                        backgroundColor: "#ffffff",
                        borderColor: "#4bc1d2",
                        color: "#333",
                        boxShadow: "0 4px 12px rgba(75,193,210,0.3)",
                      }}
                    >
                      <h4 style={{ margin: 0, marginBottom: "8px", color: "#0d4a58" }}>
                        Sort by Title
                      </h4>
                      <button
                        onClick={() => {
                          setSortOrder("asc");
                          setShowTitleFilter(false);
                          fetchBooks(searchQuery, "asc");
                        }}
                        style={submitBtnStyle}
                      >
                        Ascending ↑
                      </button>
                      <button
                        onClick={() => {
                          setSortOrder("desc");
                          setShowTitleFilter(false);
                          fetchBooks(searchQuery, "desc");
                        }}
                        style={submitBtnStyle}
                      >
                        Descending ↓
                      </button>
                      <button onClick={() => setShowTitleFilter(false)} style={closeBtnStyle}>
                        Close
                      </button>
                    </div>
                  )}
                </div>

                {/* Filter by Page */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowPageFilter(true)}
                    style={{
                      ...styles.button,
                      fontSize: "18px",
                      color: "black",
                      fontWeight: "600",
                      padding: "14px 24px",
                      minWidth: "150px",
                      height: "48px",
                      borderRadius: "8px",
                    }}
                  >
                    📄 Filter by Page
                  </button>
                  {showPageFilter && (
                    <div
                      style={{
                        ...popupStyle,
                        top: "100%",
                        left: 0,
                        marginTop: "6px",
                        width: "240px",
                        backgroundColor: "#ffffff",
                        borderColor: "#4bc1d2",
                        color: "#333",
                        boxShadow: "0 4px 12px rgba(75,193,210,0.3)",
                      }}
                    >
                      <h4 style={{ margin: 0, marginBottom: "8px", color: "#0d4a58" }}>
                        Filter by Page Range
                      </h4>
                      <input
                        type="number"
                        placeholder="Min pages"
                        value={pageRange.min}
                        onChange={(e) =>
                          setPageRange({ ...pageRange, min: e.target.value })
                        }
                        style={popupInputStyle}
                      />
                      <input
                        type="number"
                        placeholder="Max pages"
                        value={pageRange.max}
                        onChange={(e) =>
                          setPageRange({ ...pageRange, max: e.target.value })
                        }
                        style={popupInputStyle}
                      />
                      <button
                        onClick={() => {
                          handlePageRangeFilter(Number(pageRange.min), Number(pageRange.max));
                          setShowPageFilter(false);
                        }}
                        style={submitBtnStyle}
                      >
                        Submit
                      </button>
                      <button onClick={() => setShowPageFilter(false)} style={closeBtnStyle}>
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {searchQuery && books.length === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  padding: '10px',
                  backgroundColor: '#fff',
                  border: '1px solid #eee',
                  borderRadius: '0 0 6px 6px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  color: "#333333"
                }}>
                  No books found with the exact title "{searchQuery}"
                </div>
              )}
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
                  const isMatch = activeFilter === "ALL" || book.letter === activeFilter;
                  return isMatch;
                })
                .map((book) => (
                  <div key={book.id} style={styles.bookCard}>
                    {/* Star icon at top-right */}
                    <div
                      onClick={() => setMarkingReadFor(book.id)}
                      style={{
                        position: "absolute",
                        bottom: "8px",
                        right: "8px",
                        cursor: "pointer",
                        fontSize: "20px",
                        color: "#4bc1d2",
                      }}
                      title="Mark as Read"
                    >
                      ✅
                    </div>

                    {/* Book Cover */}
                    <div style={styles.bookCover}>
                      <img src={book.coverUrl || "/placeholder.svg"} alt={book.title} style={styles.bookImage} />
                    </div>

                    {/* Book Info */}
                    <div style={styles.bookInfo}>
                      <h4 style={styles.bookTitle}>{book.title}</h4>
                      <p style={styles.bookAuthor}>{book.author}</p>
                    </div>

                    {markingReadFor === book.id && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "40px",
                          right: "10px",
                          backgroundColor: "#fff",
                          border: "1px solid #000",
                          borderRadius: "8px",
                          padding: "12px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                          zIndex: 100,
                          width: "220px",
                        }}
                      >
                        <textarea
                          placeholder="Write a short review"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          style={{ width: "100%", height: "60px", marginBottom: "10px" }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <button
                            onClick={async () => {
                              try {
                                const username = localStorage.getItem('user_id');
                                const res = await fetch(`http://127.0.0.1:5000/api/mark-as-read?username=${username}`, {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    book_id: book.id,
                                    review: reviewText,
                                  }),
                                });

                                const result = await res.json();
                                console.log(result);

                                setMarkingReadFor(null);
                                setReviewText("");
                              } catch (error) {
                                console.error("Error marking book as read:", error);
                              }
                            }}
                            style={{
                              backgroundColor: "#4bc1d2",
                              color: "#fff",
                              padding: "6px 10px",
                              borderRadius: "4px",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => {
                              setMarkingReadFor(null);
                              setReviewText("");
                            }}
                            style={{
                              backgroundColor: "#888",
                              color: "#fff",
                              padding: "6px 10px",
                              borderRadius: "4px",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Star Confirmation Popup */}
                    {popupVisibleFor === book.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: "40px",
                          right: "10px",
                          backgroundColor: "#fff",
                          border: "1px solid #000",
                          borderRadius: "8px",
                          padding: "12px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                          zIndex: 100,
                          width: "200px",
                        }}
                      >
                        <p style={{ marginBottom: "12px", color: "#000", fontWeight: "500" }}>
                          Do you want to star or unstar this book?
                        </p>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch("http://127.0.0.1:5000/api/star", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    book_id: book.id,
                                    starred: true,
                                  }),
                                });

                                const result = await res.json();
                                console.log(result);

                                const updatedBooks = books.map((b) =>
                                  b.id === book.id ? { ...b, starred: true } : b
                                );
                                setBooks(updatedBooks);
                                setPopupVisibleFor(null);
                              } catch (error) {
                                console.error("Error starring book:", error);
                              }
                            }}
                            style={{
                              backgroundColor: "#4bc1d2",
                              color: "#fff",
                              padding: "6px 10px",
                              borderRadius: "4px",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            Star
                          </button>

                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch("http://127.0.0.1:5000/api/unstar", {
                                  method: "DELETE",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    book_id: book.id,
                                  }),
                                });

                                const result = await res.json();
                                console.log(result);

                                const updatedBooks = books.map((b) =>
                                  b.id === book.id ? { ...b, starred: false } : b
                                );
                                setBooks(updatedBooks);
                                setPopupVisibleFor(null);
                              } catch (error) {
                                console.error("Error unstarring book:", error);
                              }
                            }}
                            style={{
                              backgroundColor: "#888",
                              color: "#fff",
                              padding: "6px 10px",
                              borderRadius: "4px",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            Unstar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        );
    }
  };

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
                  e.currentTarget.style.backgroundColor = "#f0f0f0";
                }
              }}
              onMouseLeave={(e) => {
                if (activeNavItem !== item) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.searchContainer}></div>
          <div style={styles.userSection}>
            <div>
              <div style={styles.userText}>Welcome back!</div>
              <div style={styles.userSubText}>Manage your library</div>
            </div>
            <div style={styles.avatar}>U</div>
          </div>
        </div>

        {/* Dynamic Content based on active nav item */}
        {renderContent()}
      </div>

      {/* Floating Action Button - only show on Library page */}
      {activeNavItem === "Library" && (
        <button
          onClick={() => setShowAddBookModal(true)}
          style={styles.fab}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.15)";
          }}
        >
          +
        </button>
      )}

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddBookModal(false)}>
          <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add New Book</h3>
              <button onClick={() => setShowAddBookModal(false)} style={styles.closeButton}>
                ×
              </button>
            </div>
            <form onSubmit={handleAddBook} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Title</label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Author</label>
                <input
                  type="text"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Author Date of Birth</label>
                <input
                  type="date"
                  value={newBook.authorDob}
                  onChange={(e) => setNewBook({ ...newBook, authorDob: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Issue/Edition</label>
                <input
                  type="text"
                  value={newBook.issue}
                  onChange={(e) => setNewBook({ ...newBook, issue: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Page Length</label>
                <input
                  type="number"
                  value={newBook.pageLength}
                  onChange={(e) => setNewBook({ ...newBook, pageLength: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Cover URL</label>
                <input
                  type="url"
                  value={newBook.coverUrl}
                  onChange={(e) => setNewBook({ ...newBook, coverUrl: e.target.value })}
                  style={styles.input}
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Publisher</label>
                <input
                  type="text"
                  value={newBook.publisher}
                  onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                  style={styles.input}
                />
              </div>

              {/* Cover Preview */}
              {newBook.coverUrl && (
                <div style={styles.previewSection}>
                  <div style={styles.previewTitle}>Cover Preview</div>
                  <div style={styles.previewCover}>
                    <img src={newBook.coverUrl} alt="Cover preview" style={styles.previewImage} />
                  </div>
                </div>
              )}

              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  style={styles.cancelButton}
                >
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
  );
}