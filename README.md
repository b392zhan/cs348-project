## SHELFIE
Shelfie is a minimalist, user-focused application designed to help individuals log and organize their personal book collections. Think of it as a personal library for users themselves! Shelfie allows users to record books they've read, plan a wishlist of future reads, and search for books they are interested in learning more about.

With features like personalized ratings, reading dates, reviews, and priority-based wishlists, Shelfie serves as a digital bookshelf for book lovers of all ages. Each user contributes to their own dataset, entering details like title, issue, page length, and author, allowing complete control over their library.

## How to Run
Under config.py, edit DB_PASSWORD with your own password.

Next run the frontend using npm run dev under my-next-js-app

Then run the backend using python3 main.py under my-next-js-app/backend

Go to localhost and you may now use the application.

## Basic Features
🔍 Book Search

Locate specific books in your collection with our powerful search functionality. The system supports partial matches and instant results, making it easy to find any book you've added. Search queries use efficient database indexing for fast performance.

🔑 Password

Users can securely change their passwords at any time. The system requires verification of the current password before allowing changes, ensuring account security. All passwords are encrypted and never stored in plain text.

📖 Add Book

Add new titles to your personal library with complete control over the information. The system automatically handles author and publisher references, creating new entries when necessary while preventing duplicates. All book metadata is stored for easy retrieval.

⭐ Star Book

Highlight your favorite books with the star feature. This creates a special collection of your most treasured reads that you can quickly access. The star status persists across all views and devices.

🏆 Top Authors

Discover information about your most-read authors, including how many of their works you've completed. This feature analyzes your reading history to surface your personal literary preferences and trends.

## Advanced Features
🔄 Book Status Update

This comprehensive feature applies all necessary table changes when updating a book's status. Whether marking a book as read, adding a review, or changing reading dates, the system maintains data integrity across all related tables through atomic transactions.

📈 Reading Stats View

Get a summarized view of your reading trends with beautiful visualizations. See your reading frequency, page counts over time, genre distributions, and other insightful metrics about your literary journey.

👨💻 Admin Dashboard

Administrators can access special tools and information through this dedicated interface. Monitor system health, view user statistics, manage content flags, and configure application settings from one centralized location.

🎯 Reading Challenges

Set and track personalized reading goals with our challenges system. Whether you want to read more books by diverse authors, hit a yearly target, or explore new genres, Shelfie helps you stay motivated and track your progress.

📚 Top Book

Discover the most read book across the entire Shelfie community for any given year. This feature analyzes aggregated reading data to surface popular titles and literary trends among all users.

## How to Generate Production Data
Book dataset is populated by a set found on Kaggle with real-world titles (see below). To both manage and utilize the data for our purposes, the dataset comprises 10,000 books and 5,000 authors. The data was further transformed using Python scripts to normalize fields like author and mapping to keys. After formatting the new CSV file, it was uploaded to MySQL Workbench using Import Wizard. Throughout the process, linkages were established and verified to yield results.

Primary Data Source: https://www.kaggle.com/datasets/saurabhbagchi/books-dataset

Python Scripts: https://github.com/b392zhan/cs348-project/tree/main/my-nextjs-app/backend/scripts
