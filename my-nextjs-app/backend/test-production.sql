--Basic Query 1: User creation
INSERT INTO User (username, password, name, age) VALUES ('test123', 'mypassword', 'Tester', 22);
SELECT * FROM User WHERE username = 'test123' AND password = 'mypassword';
SELECT password FROM User WHERE user_id = 5;
UPDATE User SET password = 'newsecurepassword' WHERE user_id = 5;

--Basic Query 2: Searching, Sorting, Filtering
--Searching
SELECT 
    b.book_id, 
    b.title, 
    b.issue, 
    b.page_length,
    GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') AS authors,
    b.cover_url
FROM Book b
LEFT JOIN WrittenBy wb ON b.book_id = wb.book_id
LEFT JOIN Author a ON wb.author_id = a.author_id
WHERE b.title LIKE '%Harry%' AND b.user_id = 'john_doe'
GROUP BY b.book_id, b.title, b.issue, b.page_length, b.cover_url
ORDER BY b.title;
-- Sorting
SELECT 
    b.book_id, 
    b.title, 
    b.issue, 
    b.page_length,
    b.cover_url,
    GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') AS authors
FROM Book b
LEFT JOIN WrittenBy wb ON b.book_id = wb.book_id
LEFT JOIN Author a ON wb.author_id = a.author_id
WHERE b.user_id = %s
[AND b.title LIKE %s]
GROUP BY b.book_id, b.title, b.issue, b.page_length, b.cover_url
ORDER BY b.title ASC|DESC;
-- Filtering
SELECT 
    b.book_id, b.title, b.issue, b.page_length, b.cover_url,
    GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') AS authors
FROM Book b
LEFT JOIN WrittenBy wb ON b.book_id = wb.book_id
LEFT JOIN Author a ON wb.author_id = a.author_id
WHERE b.page_length BETWEEN 200 AND 400 AND b.user_id = 'john_doe'
GROUP BY b.book_id
ORDER BY b.page_length ASC;

--Basic Query 3: Add Books to library
SELECT username FROM User WHERE user_id = 5;
INSERT INTO Author (name, date_of_birth) 
SELECT “F. Scott Fitzgerald”, “1896-09-24”
WHERE NOT EXISTS (
    SELECT 1 FROM Author WHERE name = “F. Scott Fitzgerald”
);
SELECT author_id FROM Author WHERE name = “F. Scott Fitzgerald”;
INSERT INTO Publisher (name) 
SELECT “Scribner”
WHERE NOT EXISTS (
    SELECT 1 FROM Publisher WHERE name = “Scribner”
);
SELECT publisher_id FROM Publisher WHERE name = “Scribner”;
INSERT INTO Book (title, issue, page_length, cover_url, user_id) 
VALUES (“The Great Gatsby”, “3rd Edition”, 180, “https://example.com/covers/great-gatsby.jpg”, 5);
INSERT INTO WrittenBy (book_id, author_id) 
VALUES (LAST_INSERT_ID(), 15);
INSERT INTO PublishedBy (book_id, publisher_id) 
VALUES (LAST_INSERT_ID(), 8);

-- Basic Query 4: Star/Unstar
-- Starring a Book 
INSERT INTO Starred (user_id, book_id, starred)
VALUES ('999', 456, TRUE)
ON DUPLICATE KEY UPDATE starred = VALUES(starred);
-- Unstarring a Book
DELETE FROM Starred WHERE user_id = '999' AND book_id = 456;

-- Basic Query 5: Top 10 authors
SELECT 
    a.author_id,
    a.name AS author_name,
    COUNT(b.book_id) AS num_books
FROM Author a
JOIN WrittenBy wb ON a.author_id = wb.author_id
JOIN Book b ON b.book_id = wb.book_id
WHERE b.user_id = 3
GROUP BY a.author_id, a.name
ORDER BY num_books DESC
LIMIT 10;

-- Advanced Query 1: Mark as read
WITH InsertData AS (
    SELECT 101 as user_id, 501 as book_id, CURDATE() as date, 'Amazing book!' as review
)
INSERT INTO HasRead (user_id, book_id, date, review)
SELECT user_id, book_id, date, review
FROM InsertData;
WITH UserBooks AS (
    SELECT 
        h.book_id,
        h.review,
        h.date,
        b.title,
        b.issue,
        b.page_length
    FROM HasRead h
    JOIN Book b ON h.book_id = b.book_id
    JOIN User u ON h.user_id = u.user_id
    WHERE u.user_id = 101
)
SELECT book_id, title, issue, page_length, review, date
FROM UserBooks;
WITH UpdateTarget AS (
    SELECT user_id, book_id
    FROM HasRead
    WHERE user_id = 101 AND book_id = 501
)
UPDATE HasRead h
JOIN UpdateTarget ut ON h.user_id = ut.user_id AND h.book_id = ut.book_id
SET h.review = 'Changed my mind, it was just okay.';

-- Advanced Query 2: Statistics View
-- Replace %s with 1
WITH RECURSIVE UserReadingData AS (
    SELECT 
        hr.user_id,
        hr.book_id,
        hr.date,
        hr.hasread_id,
        b.title,
        b.page_length,
        ROW_NUMBER() OVER (PARTITION BY hr.user_id ORDER BY hr.date ASC) as read_sequence,
        ROW_NUMBER() OVER (PARTITION BY hr.user_id ORDER BY hr.hasread_id DESC) as latest_sequence,
        COUNT(*) OVER (PARTITION BY hr.user_id) as total_books_count,
        1 as depth_level
    FROM HasRead hr
    JOIN Book b ON b.book_id = hr.book_id
    WHERE hr.user_id = 1
    UNION ALL
    SELECT 
        urd.user_id,
        urd.book_id,
        urd.date,
        urd.hasread_id,
        urd.title,
        urd.page_length,
        urd.read_sequence,
        urd.latest_sequence,
        urd.total_books_count,
        urd.depth_level + 1
    FROM UserReadingData urd
    WHERE urd.depth_level < 2
),
AuthorAnalysis AS (
    SELECT 
        a.author_id,
        a.name,
        COUNT(*) as books_by_author,
        RANK() OVER (ORDER BY COUNT(*) DESC) as author_rank,
        DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) as author_dense_rank
    FROM UserReadingData urd
    JOIN WrittenBy wb ON urd.book_id = wb.book_id
    JOIN Author a ON a.author_id = wb.author_id
    WHERE urd.depth_level = 1
    GROUP BY a.author_id, a.name
),
BookSequence AS (
    SELECT 
        title,
        read_sequence,
        latest_sequence,
        CASE WHEN read_sequence = 1 THEN title END as first_book_title,
        CASE WHEN latest_sequence = 1 THEN title END as latest_book_title
    FROM UserReadingData
    WHERE depth_level = 1
),
PageStats AS (
    SELECT 
        COUNT(*) as total_books,
        ROUND(AVG(CASE WHEN page_length IS NOT NULL THEN page_length END), 1) as avg_pages,
        STDDEV(page_length) as page_stddev,
        MIN(page_length) as min_pages,
        MAX(page_length) as max_pages
    FROM UserReadingData
    WHERE depth_level = 1 AND page_length IS NOT NULL
)
SELECT 
    ps.total_books,
    ps.avg_pages,
    (SELECT name FROM AuthorAnalysis WHERE author_rank = 1 LIMIT 1) as favorite_author,
    (SELECT title FROM BookSequence WHERE first_book_title IS NOT NULL LIMIT 1) as first_book,
    (SELECT title FROM BookSequence WHERE latest_book_title IS NOT NULL LIMIT 1) as latest_book
FROM PageStats ps;

-- Advanced Query 3: Reading Challenges
WITH yearly_reads AS (
    SELECT *, YEAR(read_at) AS read_year
    FROM HasRead
    WHERE user_id = 1
),
year_aggregation AS (
    SELECT read_year, COUNT(*) AS total_books
    FROM yearly_reads
    GROUP BY read_year
)
SELECT total_books
FROM year_aggregation
WHERE read_year = YEAR(CURDATE());
WITH RECURSIVE author_books AS (
    SELECT hr.user_id, b.id AS book_id, wa.author_id
    FROM HasRead hr
    JOIN Book b ON hr.book_id = b.id
    JOIN WrittenBy wa ON b.id = wa.book_id
    WHERE hr.user_id = 1
),
author_counts_cte AS (
    SELECT author_id, COUNT(DISTINCT book_id) AS book_count
    FROM author_books
    GROUP BY author_id
)
SELECT MAX(book_count) AS max_books_by_author
FROM author_counts_cte;
WITH user_books AS (
    SELECT b.pages, hr.read_at
    FROM HasRead hr
    JOIN Book b ON hr.book_id = b.id
    WHERE hr.user_id = 1
),
page_calculations AS (
    SELECT IFNULL(SUM(pages), 0) AS total_pages_read
    FROM user_books
)
SELECT total_pages_read
FROM page_calculations;

-- Advanced Query 4: Most read book
CREATE OR REPLACE VIEW MostReadBookView AS
       SELECT
           b.book_id,
           b.title,
           COUNT(h.hasread_id) AS read_count
       FROM HasRead h
       JOIN Book b ON b.book_id = h.book_id
       GROUP BY b.book_id, b.title

SELECT
v.book_id,
v.title,
v.read_count
FROM MostReadBookView v
JOIN HasRead h ON v.book_id = h.book_id
WHERE YEAR(h.date) = 2025
ORDER BY v.read_count DESC
LIMIT 1;

-- Advanced Query 5: Admin Panel
SELECT u.user_id, u.username, u.name, u.age, 
       COUNT(b.book_id) AS book_count
FROM User u 
LEFT JOIN Book b ON u.user_id = b.user_id 
WHERE u.username != 'admin'
GROUP BY u.user_id, u.username, u.name, u.age
ORDER BY u.user_id;
DELETE FROM User WHERE user_id = 3;
SELECT COUNT(*) AS total_users FROM User WHERE username != 'admin';
SELECT COUNT(*) AS total_books FROM Book;
SELECT COUNT(*) AS total_reads FROM HasRead;
SELECT COUNT(DISTINCT book_id) AS unique_books_read FROM HasRead;
SELECT u.username, u.name, COUNT(b.book_id) AS book_count
FROM User u 
LEFT JOIN Book b ON u.user_id = b.user_id 
WHERE u.username != 'admin'
GROUP BY u.user_id, u.username, u.name
ORDER BY book_count DESC
LIMIT 5;
SELECT 
    DATE(date) AS read_date,
    COUNT(*) AS books_read
FROM HasRead 
WHERE DATE(date) BETWEEN '2025-07-23' AND '2025-07-29'
GROUP BY DATE(date)
ORDER BY DATE(date);
DELETE FROM Book WHERE book_id = 42 AND user_id = 3;
