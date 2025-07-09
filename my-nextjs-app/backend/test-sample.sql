-- R6 Feature - search by book title
SELECT b.book_id, b.title, b.issue, b.page_length, GROUP_CONCAT(
        DISTINCT a.name SEPARATOR ', '
    ) AS authors, b.cover_url
FROM
    Book b
    LEFT JOIN WrittenBy wb ON b.book_id = wb.book_id
    LEFT JOIN Author a ON wb.author_id = a.author_id
WHERE
    b.title LIKE % "My Book Cover" %
GROUP BY
    b.book_id,
    b.title,
    b.issue,
    b.page_length,
    b.cover_url
ORDER BY b.title

-- R7 Feature - starring a book
ALTER TABLE Book ADD COLUMN starred BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE Book SET starred = FALSE;

—- When user stars a book:
UPDATE Book SET starred = TRUE WHERE book_id = 456;

—- When user unstars a book:
UPDATE Book SET starred = FALSE WHERE book_id = 456;

-- R8 Feature - sorting by title ascending
SELECT b.book_id, b.title, b.issue, B.page_length, GROUP_CONCAT(
        DISTINCT a.name SEPARATOR ', '
    ) AS authors, B.cover_url
FROM
    Book b
    LEFT JOIN WrittenBy wb ON b.book_id = wb.book_id
    LEFT JOIN Author a ON wb.author_id = a.author_id
GROUP BY
    b.book_id,
    b.title,
    b.issue,
    b.page_length,
    b.cover_url
ORDER BY b.title ASC;

-- R8 Feature - sorting by title descending
SELECT b.book_id, b.title, b.issue, B.page_length, GROUP_CONCAT(
        DISTINCT a.name SEPARATOR ', '
    ) AS authors, B.cover_url
FROM
    Book b
    LEFT JOIN WrittenBy wb ON b.book_id = wb.book_id
    LEFT JOIN Author a ON wb.author_id = a.author_id
GROUP BY
    b.book_id,
    b.title,
    b.issue,
    b.page_length,
    b.cover_url
ORDER BY b.title DESC;

-- R9 - Star a Book
INSERT INTO
    HasStarred (user_id, book_id, starred)
VALUES (999, 456, TRUE);

-- R9 - Unstar a Book
DELETE FROM HasStarred WHERE book_id = 456;

-- R10 Feature - adding a new book
-- Step 1: Insert Author if not exists
INSERT INTO
    Author (name, date_of_birth)
SELECT 'J.K. Rowling', '1965-07-31'
WHERE
    NOT EXISTS (
        SELECT 1
        FROM Author
        WHERE
            name = 'J.K. Rowling'
    );

-- Step 2: Get author_id
SELECT author_id FROM Author WHERE name = 'J.K. Rowling';

-- Step 3: Insert Publisher if not exists
INSERT INTO
    Publisher (name)
SELECT 'Bloomsbury'
WHERE
    NOT EXISTS (
        SELECT 1
        FROM Publisher
        WHERE
            name = 'Bloomsbury'
    );

-- Step 4: Get publisher_id
SELECT publisher_id FROM Publisher WHERE name = 'Bloomsbury';

-- Step 5: Insert Book
INSERT INTO
    Book (
        title,
        issue,
        page_length,
        cover_url
    )
VALUES (
        'Harry Potter and the Philosopher''s Stone',
        '1st Edition',
        223,
        '/hp1.jpg'
    );

-- Step 6: Link to Author
INSERT INTO WrittenBy (book_id, author_id)
VALUES (LAST_INSERT_ID(), [AUTHOR_ID]);

-- Step 7: Link to Publisher
INSERT INTO PublishedBy (book_id, publisher_id)
VALUES (LAST_INSERT_ID(), [PUBLISHER_ID]);