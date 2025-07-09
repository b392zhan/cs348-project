-- R6 - Book Search by Title
SELECT b.book_id, b.title, b.issue, b.page_length, GROUP_CONCAT(
        DISTINCT a.name SEPARATOR ', '
    ) AS authors, b.cover_url
FROM
    Book b
    LEFT JOIN WrittenBy wb ON b.book_id = wb.book_id
    LEFT JOIN Author a ON wb.author_id = a.author_id
WHERE
    b.title LIKE "%My Book Cover%"
GROUP BY
    b.book_id,
    b.title,
    b.issue,
    b.page_length,
    b.cover_url
ORDER BY b.title;

-- R7 - Sort Books Alphabetically (Ascending)
SELECT b.book_id, b.title, b.issue, b.page_length, GROUP_CONCAT(
        DISTINCT a.name SEPARATOR ', '
    ) AS authors, b.cover_url
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

-- R7 - Sort Books Alphabetically (Descending)
SELECT b.book_id, b.title, b.issue, b.page_length, GROUP_CONCAT(
        DISTINCT a.name SEPARATOR ', '
    ) AS authors, b.cover_url
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

-- R8 - Add a New Book to Library
INSERT INTO
    Author (name, date_of_birth)
SELECT "F. Scott Fitzgerald", "1896-09-24"
WHERE
    NOT EXISTS (
        SELECT 1
        FROM Author
        WHERE
            name = "F. Scott Fitzgerald"
    );

SELECT author_id FROM Author WHERE name = "F. Scott Fitzgerald";

INSERT INTO
    Publisher (name)
SELECT "Scribner"
WHERE
    NOT EXISTS (
        SELECT 1
        FROM Publisher
        WHERE
            name = "Scribner"
    );

SELECT publisher_id FROM Publisher WHERE name = "Scribner";

INSERT INTO
    Book (
        title,
        issue,
        page_length,
        cover_url
    )
VALUES (
        "The Great Gatsby",
        "3rd Edition",
        180,
        "https://example.com/covers/great-gatsby.jpg"
    );

INSERT INTO
    WrittenBy (book_id, author_id)
VALUES (LAST_INSERT_ID(), 15);

INSERT INTO
    PublishedBy (book_id, publisher_id)
VALUES (LAST_INSERT_ID(), 8);

-- R9 - Star a Book
INSERT INTO
    HasStarred (user_id, book_id, starred)
VALUES (999, 456, TRUE);

-- R9 - Unstar a Book
DELETE FROM HasStarred WHERE book_id = 456;

-- R10 - Filter by Page Length Range
SELECT b.book_id, b.title, b.issue, b.page_length, b.cover_url, GROUP_CONCAT(
        DISTINCT a.name SEPARATOR ', '
    ) AS authors
FROM
    Book b
    LEFT JOIN WrittenBy wb ON b.book_id = wb.book_id
    LEFT JOIN Author a ON wb.author_id = a.author_id
WHERE
    b.page_length > 300
GROUP BY
    b.book_id
ORDER BY b.page_length ASC;