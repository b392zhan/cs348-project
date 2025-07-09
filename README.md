# SHELFIE

Shelfie is a minimalist, user-focused application designed to help individuals log and organize their personal book collections. Think of it as a personal library for users themselves! Shelfie allows users to record books they’ve read, plan a wishlist of future reads, and search for books they are interested in learning more about.

With features like personalized ratings, reading dates, reviews, and priority-based wishlists, Shelfie serves as a digital bookshelf for book lovers of all ages. Each user contributes to their own dataset, entering details like title, issue, page length, and author, allowing complete control over their library.

## How to Run
Under config.py, edit DB_PASSWORD with your own password.

Next run the frontend using _npm run dev_ under my-next-js-app

Then run the backend using _python3 main.py_ under my-next-js-app/backend

Go to localhost and you may now use the application.

## Current Features
1. 📘 Create Book

Users can add a new book to their personal library by providing important details such as title, author, genre, ISBN, and publisher. To ensure data consistency, if the specified author or publisher doesn’t already exist in the database, they are automatically inserted (IF NOT EXISTS) before the book entry is created. The new book is then linked to the user’s reading list via ToReadList or HasRead.

2. 🔤 Sort Books Alphabetically

From the Display menu in the UI, users can sort their entire book list in ascending alphabetical order based on the book title. This allows for easy browsing and a familiar bookshelf-like experience.

3. 🔍 Search for Books

A search bar at the top of the interface allows users to search for books by name using partial matches. The SQL query behind this feature uses the LIKE operator to support flexible keyword input (e.g., "%harry%" will match "Harry Potter and the Chamber of Secrets").

4. ⭐ Starred Books

Every book entry includes a star icon in the UI to allow users to "favourite" or highlight books. Newly created books default to an unselected (unstarred) state. When a user clicks the star, it toggles the starred boolean column in the Book table (or a separate StarredBooks table if modeled that way). This helps users quickly identify their most treasured reads.

5. 📖 Book Length

Books in the library can be filtered by their page length. When a user uses this filter, they can quickly know how long it would take to read these books, as they now know the page length and can better estimate their reading time.

## How to Generate Production Data

Book dataset is populated by a set found on Kaggle with real-world titles. To both manage and utilize the data for our purposes, the dataset comprises 10,000 books and 5,000 authors. The data was further transformed using Python to normalize fields like author and mapping to keys. After formatting the new CSV file, it was uploaded to MySQL Workbench using Import Wizard. Throughout the process, linkages were established and verified to yield results.





