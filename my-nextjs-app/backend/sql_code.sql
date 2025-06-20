-- Create User Table
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create Author Table
CREATE TABLE Author (
    author_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE
);

-- Create Publisher Table
CREATE TABLE Publisher (
    publisher_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Create Book Table
CREATE TABLE Book (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    issue VARCHAR(255),
    page_length INT,
    cover_url VARCHAR(400)
);

-- Create HasRead Junction Table (User-Book with review)
CREATE TABLE HasRead (
    hasread_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    date DATE NOT NULL,
    review TEXT,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (book_id) REFERENCES Book(book_id)
);

-- Create ToReadList Junction Table
CREATE TABLE ToReadList (
    toread_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    date DATE NOT NULL,
    priority ENUM('Low', 'Medium', 'High') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (book_id) REFERENCES Book(book_id)
);

-- Create WrittenBy Junction Table
CREATE TABLE WrittenBy (
    book_id INT NOT NULL,
    author_id INT NOT NULL,
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id) REFERENCES Book(book_id),
    FOREIGN KEY (author_id) REFERENCES Author(author_id)
);

-- Create PublishedBy Junction Table
CREATE TABLE PublishedBy (
    book_id INT NOT NULL,
    publisher_id INT NOT NULL,
    PRIMARY KEY (book_id, publisher_id),
    FOREIGN KEY (book_id) REFERENCES Book(book_id),
    FOREIGN KEY (publisher_id) REFERENCES Publisher(publisher_id)
);
