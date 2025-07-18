from flask import Flask, jsonify, request, g, render_template
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import click
import random

app = Flask(__name__)
CORS(app)
app.config.from_object('config.Config')

def get_db():
    """Get database connection, reusing if exists in g"""
    if 'db' not in g or not g.db.is_connected():
        g.db = mysql.connector.connect(
            host=app.config['DB_HOST'],
            user=app.config['DB_USER'],
            password=app.config['DB_PASSWORD'],
            database=app.config['DB_DATABASE']
        )
    return g.db

@app.teardown_appcontext
def close_db(error):
    """Close database connection after each request"""
    db = g.pop('db', None)
    if db is not None and db.is_connected():
        db.close()

def init_db():
    """Initialize database tables"""
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE
            )
        """)
        

        db.commit()
        print("✅ Database tables initialized")
    except Error as err:
        print(f"❌ Database initialization error: {err}")
    finally:
        if 'cursor' in locals():
            cursor.close()

def check_db_connection():
    """Simple database connection check"""
    try:
        conn = mysql.connector.connect(
            host=app.config['DB_HOST'],
            user=app.config['DB_USER'],
            password=app.config['DB_PASSWORD'],
            database=app.config['DB_DATABASE']
        )
        if conn.is_connected():
            print("✅ Connected to MySQL database")
            return True
    except Error as err:
        print(f"❌ Connection failed: {err}")
        return False
    finally:
        if 'conn' in locals() and conn.is_connected():
            conn.close()

with app.app_context():
    init_db()

@click.command('test-db')
def test_db_command():
    """Test database connection via CLI"""
    if check_db_connection():
        click.echo('Database connection successful!')
    else:
        click.echo('Database connection failed!')

app.cli.add_command(test_db_command)

@app.route('/api/health')
def health_check():
    return jsonify(
        status="healthy",
        message="Flask server is running",
        database="MySQL"
    )

@app.route('/api/test_db')
def test_db_connection():
    """Test database connection and return detailed status"""
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT VERSION(), CONNECTION_ID()")
        version, connection_id = cursor.fetchone()
        cursor.close()
        
        return jsonify({
            "status": "success",
            "message": "Database connection working",
            "mysql_version": version,
            "connection_id": connection_id,
            "is_connected": db.is_connected()
        })
    except Error as err:
        return jsonify({
            "status": "error",
            "message": f"Database error: {err}",
            "error_code": err.errno if hasattr(err, 'errno') else None
        }), 500
    except Exception as e:
        return jsonify({
            "status": "error", 
            "message": str(e)
        }), 500

@app.route('/')
def index():
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email FROM users")
        users = cursor.fetchall()
        cursor.close()
        return render_template('index.html', users=users)
    except Error as err:
        return f"Database error: {err}", 500
    except Exception as e:
        return f"Error: {str(e)}", 500

@app.route('/add', methods=['POST'])
def add_user():
    try:
        name = request.form['name']
        email = request.form['email']
        
        if not name or not email:
            return jsonify({"status": "error", "message": "Name and email are required"}), 400
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO users (name, email) VALUES (%s, %s)",
            (name, email)
        )
        db.commit()
        cursor.close()
        return jsonify({"status": "success", "message": "User added!"})
    except Error as err:
        if err.errno == 1062:
            return jsonify({"status": "error", "message": "Email already exists"}), 409
        return jsonify({"status": "error", "message": str(err)}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/users', methods=['POST'])
def add_user_api():
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'email' not in data:
            return jsonify({"status": "error", "message": "Name and email are required"}), 400
        
        name = data['name']
        email = data['email']
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO users (name, email) VALUES (%s, %s)",
            (name, email)
        )
        db.commit()
        user_id = cursor.lastrowid
        cursor.close()
        
        return jsonify({
            "status": "success", 
            "message": "User added!",
            "user_id": user_id
        }), 201
    except Error as err:
        if err.errno == 1062:
            return jsonify({"status": "error", "message": "Email already exists"}), 409
        return jsonify({"status": "error", "message": str(err)}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/users', methods=['GET'])
def get_users_api():
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email FROM users")
        users = cursor.fetchall()
        cursor.close()
        return jsonify({
            "status": "success",
            "users": users,
            "count": len(users)
        })
    except Error as err:
        return jsonify({"status": "error", "message": str(err)}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user_api(user_id):
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        cursor.close()
        
        if user:
            return jsonify({"status": "success", "user": user})
        else:
            return jsonify({"status": "error", "message": "User not found"}), 404
    except Error as err:
        return jsonify({"status": "error", "message": str(err)}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/hello")
def hello():
    return jsonify(message="Hello from Flask!")

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"status": "error", "message": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"status": "error", "message": "Internal server error"}), 500




@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']
    name = data.get('name', '')
    age = data.get('age', None)
    
    db = get_db()
    

    cursor = db.cursor()
    try:
        cursor.execute("INSERT INTO User (username, password, name, age) VALUES (%s, %s, %s, %s)",
                       (username, password, name, age))
        db.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except mysql.connector.IntegrityError:
        return jsonify({'error': 'Username already exists'}), 400

from flask import request, jsonify, make_response

@app.route('/api/login', methods=['POST']) 
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']
    
    print("Username is ", username)
    print("Username is ", password)
    

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM User WHERE username = %s AND password = %s", (username, password))
    user = cursor.fetchone()

    if user:
        response = make_response(jsonify({'message': 'Login successful', 'user_id': user['user_id']}))
        
        # Set cookie for 1 day (adjust as needed)
        response.set_cookie(
            'user_id',
            str(user['user_id']),
            max_age=60*60*24,  # 1 day
            httponly=False,    # set to True if you want to restrict JavaScript access
            samesite='Lax'
        )

        return response, 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401


@app.route('/api/books', methods=['POST'])
def log_book_from_ui():
    try:
        db = get_db()
        cursor = db.cursor()
        
        data = request.get_json()
        
        
        user_id = data.get('user_id')
        
        cursor.execute("SELECT username FROM User WHERE user_id = %s", (user_id,))
        row = cursor.fetchone()
        username = row[0] if row else None

        print("Username associated with user_id", user_id, "is:", username)
        

        title = data.get('title')
        issue = data.get('issue')
        page_length = data.get('page_length')
        cover_url = data.get('cover_url')
        author_name = data.get('author')
        author_dob = data.get('author_dob')
        publisher_name = data.get('publisher')  # This must come from frontend now

        if not title or not author_name or not publisher_name:
            return jsonify({"status": "error", "message": "Title, author, and publisher are required"}), 400

        

        # Step 1: Insert author if not exists
        cursor.execute("""
            INSERT INTO Author (name, date_of_birth)
            SELECT %s, %s
            WHERE NOT EXISTS (
                SELECT 1 FROM Author WHERE name = %s
            )
        """, (author_name, author_dob or None, author_name))

        # Step 2: Get author_id
        cursor.execute("SELECT author_id FROM Author WHERE name = %s", (author_name,))
        author_id = cursor.fetchone()[0]

        # Step 3: Insert publisher if not exists
        cursor.execute("""
            INSERT INTO Publisher (name)
            SELECT %s
            WHERE NOT EXISTS (
                SELECT 1 FROM Publisher WHERE name = %s
            )
        """, (publisher_name, publisher_name))

        # Step 4: Get publisher_id
        cursor.execute("SELECT publisher_id FROM Publisher WHERE name = %s", (publisher_name,))
        publisher_id = cursor.fetchone()[0]

        # Step 5: Insert book
        cursor.execute("""
            INSERT INTO Book (title, issue, page_length, cover_url, user_id)
            VALUES (%s, %s, %s, %s, %s)
        """, (title, issue or None, page_length or None, cover_url or None, user_id))
        book_id = cursor.lastrowid

        # Step 6: Insert into WrittenBy
        cursor.execute("INSERT INTO WrittenBy (book_id, author_id) VALUES (%s, %s)", (book_id, author_id))

        # Step 7: Insert into PublishedBy
        cursor.execute("INSERT INTO PublishedBy (book_id, publisher_id) VALUES (%s, %s)", (book_id, publisher_id))

        db.commit()
        cursor.close()

        return jsonify({
            "status": "success",
            "message": "Book, author, and publisher saved",
            "book_id": book_id,
            "author_id": author_id,
            "publisher_id": publisher_id
        }), 201

    except Error as err:
        print(f"❌ Database error: {err}")
        return jsonify({"status": "error", "message": str(err)}), 500
    except Exception as e:
        print(f"❌ Server error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/books/search', methods=['GET'])
def search_books():
    try:
        search_query = request.args.get('query', '').strip()
        username = request.args.get('username', '').strip()

        if not search_query or not username:
            return jsonify({"status": "error", "message": "Missing search query or username"}), 400

        db = get_db()
        cursor = db.cursor(dictionary=True)

        if not username:
            return jsonify({"status": "error", "message": "User not found"}), 404

        # Search query filtered by user_id
        cursor.execute("""
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
            WHERE b.title = %s AND b.user_id = %s
            GROUP BY b.book_id, b.title, b.issue, b.page_length, b.cover_url
            ORDER BY b.title
        """, (search_query, username))

        books = cursor.fetchall()
        cursor.close()

        formatted_books = []
        for book in books:
            formatted_books.append({
                "id": book["book_id"],
                "title": book["title"],
                "author": book["authors"] or "Unknown Author",
                "coverUrl": book["cover_url"] or "/placeholder.svg?height=192&width=128",
                "letter": book["title"][0].upper() if book["title"] else "A"
            })

        return jsonify({
            "status": "success",
            "books": formatted_books
        })

    except Error as err:
        print(f"❌ Database error during search: {err}")
        return jsonify({"status": "error", "message": str(err)}), 500
    except Exception as e:
        print(f"❌ Server error during search: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

    
@app.route('/api/books/sort', methods=['GET'])
def sort_books():
    try:
        search_query = request.args.get('query', '').strip()
        sort_order = request.args.get('sort', 'asc').lower()
        username = request.args.get('username', '').strip()  # <- ✅ Get username

        if sort_order not in ('asc', 'desc'):
            sort_order = 'asc'

        db = get_db()
        cursor = db.cursor(dictionary=True)

        # Base query with username filtering
        base_query = f"""
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
        """

        # Add search filter if given
        params = [username]
        if search_query:
            base_query += " AND b.title LIKE %s"
            params.append(search_query + '%')

        base_query += f"""
            GROUP BY b.book_id, b.title, b.issue, b.page_length, b.cover_url
            ORDER BY b.title {sort_order.upper()}
        """

        cursor.execute(base_query, params)
        books = cursor.fetchall()
        cursor.close()

        formatted_books = [{
            "id": b["book_id"],
            "title": b["title"],
            "author": b["authors"] or "Unknown Author",
            "coverUrl": b["cover_url"] or "/placeholder.svg?height=192&width=128",
            "letter": b["title"][0].upper() if b["title"] else "?"
        } for b in books]

        return jsonify({
            "status": "success",
            "books": formatted_books
        })

    except Error as err:
        print(f"❌ Database error during search: {err}")
        return jsonify({"status": "error", "message": str(err)}), 500
    except Exception as e:
        print(f"❌ Server error during search: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/star', methods=['POST'])
def star_book():
    try:
        data = request.get_json()
        book_id = data.get('book_id')
        starred = data.get('starred', True)

        if not book_id:
            return jsonify({"status": "error", "message": "Missing book_id"}), 400

        db = get_db()
        cursor = db.cursor()

        cursor.execute("SELECT MAX(user_id) FROM Starred")
        max_uid = cursor.fetchone()[0] or 0
        next_uid = max_uid + 1

        cursor.execute(
            "INSERT INTO Starred (user_id, book_id, starred) VALUES (%s, %s, %s)",
            (next_uid, book_id, starred)
        )

        db.commit()
        cursor.close()

        return jsonify({"status": "success", "message": "Book starred successfully"})

    except Exception as e:
        print(f"❌ Error starring book: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/unstar', methods=['DELETE'])
def unstar_book():
    try:
        data = request.get_json()
        book_id = data.get('book_id')

        if not book_id:
            return jsonify({"status": "error", "message": "Missing book_id"}), 400

        db = get_db()
        cursor = db.cursor()

        # Delete all star records for this book (regardless of user_id)
        cursor.execute(
            "DELETE FROM Starred WHERE book_id = %s",
            (book_id,)
        )

        db.commit()
        cursor.close()

        return jsonify({"status": "success", "message": "Book unstarred successfully"})

    except Exception as e:
        print(f"❌ Error unstarring book: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/books/page-range')
def filter_books_by_page_range():
    try:
        min_pages = request.args.get('min', type=int)
        max_pages = request.args.get('max', type=int)
        username = request.args.get('username', '').strip()


        if not username:
            return jsonify({"status": "error", "message": "Username is required"}), 400

        db = get_db()
        cursor = db.cursor(dictionary=True)

        # Filter books owned by this user in the given page range
        query = """
            SELECT 
                b.book_id, b.title, b.issue, b.page_length, b.cover_url,
                GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') AS authors
            FROM Book b
            LEFT JOIN WrittenBy wb ON b.book_id = wb.book_id
            LEFT JOIN Author a ON wb.author_id = a.author_id
            WHERE b.page_length BETWEEN %s AND %s AND b.user_id = %s
            GROUP BY b.book_id
            ORDER BY b.page_length ASC
        """
        cursor.execute(query, (min_pages, max_pages, username))
        books = cursor.fetchall()

        formatted_books = [{
            "id": b["book_id"],
            "title": b["title"],
            "author": b["authors"] or "Unknown",
            "coverUrl": b["cover_url"] or "/placeholder.svg?height=192&width=128",
            "letter": b["title"][0].upper() if b["title"] else "?"
        } for b in books]

        return jsonify({"status": "success", "books": formatted_books})

    except Exception as e:
        print("❌ Page range filter error:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/books/letter/<letter>')
def filter_books_by_letter(letter):
    try:
        username = request.args.get("username")
        if not username:
            return jsonify({"status": "error", "message": "Missing username"}), 400

        db = get_db()
        cursor = db.cursor(dictionary=True)

        query = """
            SELECT b.book_id, b.title, b.issue, b.page_length, b.cover_url,
                   GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') AS authors
            FROM Book b
            JOIN User u ON b.user_id = u.user_id
            LEFT JOIN WrittenBy wb ON b.book_id = wb.book_id
            LEFT JOIN Author a ON wb.author_id = a.author_id
            WHERE u.username = %s AND b.title LIKE %s
            GROUP BY b.book_id
            ORDER BY b.title ASC
        """
        cursor.execute(query, (username, f"{letter}%"))
        books = cursor.fetchall()

        formatted_books = [{
            "id": b["book_id"],
            "title": b["title"],
            "author": b["authors"] or "Unknown",
            "coverUrl": b["cover_url"] or "/placeholder.svg?height=192&width=128",
            "letter": b["title"][0].upper() if b["title"] else "?"
        } for b in books]

        return jsonify({"status": "success", "books": formatted_books})
    
    except Exception as e:
        print("❌ Filter letter error:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/books/all')
def get_all_books_by_user():
    try:
        username = request.args.get("username")
        if not username:
            return jsonify({"status": "error", "message": "Missing username"}), 400

        db = get_db()
        cursor = db.cursor(dictionary=True)

        query = """
            SELECT b.book_id, b.title, b.issue, b.page_length, b.cover_url,
                   GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') AS authors
            FROM Book b
            JOIN User u ON b.user_id = u.user_id
            LEFT JOIN WrittenBy wb ON b.book_id = wb.book_id
            LEFT JOIN Author a ON wb.author_id = a.author_id
            WHERE u.username = %s
            GROUP BY b.book_id
            ORDER BY b.title ASC
        """
        cursor.execute(query, (username,))
        books = cursor.fetchall()

        formatted_books = [{
            "id": b["book_id"],
            "title": b["title"],
            "author": b["authors"] or "Unknown",
            "coverUrl": b["cover_url"] or "/placeholder.svg?height=192&width=128",
            "letter": b["title"][0].upper() if b["title"] else "?"
        } for b in books]

        return jsonify({"status": "success", "books": formatted_books})
    
    except Exception as e:
        print("❌ Get all books error:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

from flask import request, jsonify
from datetime import date

@app.route('/api/mark-as-read', methods=['POST'])
def mark_as_read():
    user_id = request.args.get("username")  # really user_id
    data = request.get_json()
    book_id = data.get("book_id")
    review = data.get("review")

    if not user_id or not book_id:
        return jsonify({'error': 'Missing data'}), 400

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            INSERT INTO HasRead (user_id, book_id, date, review)
            VALUES (%s, %s, CURDATE(), %s)
        """, (user_id, book_id, review))

        db.commit()
        return jsonify({'message': 'Book marked as read'}), 200
    except Exception as e:
        print("❌ Error inserting:", e)
        return jsonify({'error': str(e)}), 500


@app.route('/api/hasread')
def get_has_read_books():
    username = request.args.get("username")

    if not username:
        return jsonify({'error': 'Username required'}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT b.book_id, b.title, b.issue, b.page_length, h.review, h.date
        FROM HasRead h
        JOIN Book b ON h.book_id = b.book_id
        JOIN User u ON h.user_id = u.user_id
        WHERE u.user_id = %s
    """, (username,))

    results = cursor.fetchall()
    return jsonify(results)


@app.route("/api/reading-stats")
def reading_stats():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user ID"}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)

    query = """
        SELECT 
            COUNT(*) AS total_books,
            ROUND(AVG(CASE WHEN b.page_length IS NOT NULL THEN b.page_length END), 1) AS avg_pages,
            (
                SELECT a.name
                FROM Author a
                JOIN WrittenBy wb ON a.author_id = wb.author_id
                JOIN Book b2 ON b2.book_id = wb.book_id
                JOIN HasRead hr2 ON hr2.book_id = b2.book_id
                WHERE hr2.user_id = %s
                GROUP BY a.author_id
                ORDER BY COUNT(*) DESC
                LIMIT 1
            ) AS favorite_author,
            (
                SELECT b.title
                FROM HasRead hr3
                JOIN Book b ON b.book_id = hr3.book_id
                WHERE hr3.user_id = %s
                ORDER BY hr3.date ASC
                LIMIT 1
            ) AS first_book,
            (
                SELECT b.title
                FROM HasRead hr4
                JOIN Book b ON b.book_id = hr4.book_id
                WHERE hr4.user_id = %s
                ORDER BY hr4.hasread_id DESC
                LIMIT 1
            ) AS latest_book
        FROM HasRead hr
        JOIN Book b ON b.book_id = hr.book_id
        WHERE hr.user_id = %s
    """

    cursor.execute(query, (user_id, user_id, user_id, user_id))
    stats = cursor.fetchone()

    # Convert avg_pages to float if it's not None
    if stats and stats.get('avg_pages') is not None:
        try:
            stats['avg_pages'] = float(stats['avg_pages'])
        except (ValueError, TypeError):
            stats['avg_pages'] = None

    print("Fetched stats:", stats)
    return jsonify(stats)

@app.route("/api/author-stats")
def author_stats():
    user_id = request.args.get("username")
    if not user_id:
        return jsonify({"error": "Missing user ID"}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Fetch top 10 authors (by number of books added by current user)
    cursor.execute("""
        SELECT 
            a.author_id,
            a.name AS author_name,
            COUNT(b.book_id) AS num_books
        FROM Author a
        JOIN WrittenBy wb ON a.author_id = wb.author_id
        JOIN Book b ON b.book_id = wb.book_id
        WHERE b.user_id = %s
        GROUP BY a.author_id, a.name
        ORDER BY num_books DESC
        LIMIT 10
    """, (user_id,))
    top_authors = cursor.fetchall()

    print(f"Found {len(top_authors)} authors for user {user_id}")

    author_stats = []

    for author in top_authors:
        author_id = author["author_id"]
        print(f"Processing author: {author['author_name']} (ID: {author_id})")

        # Stats only for books added by current user with non-NULL page_length
        cursor.execute("""
            SELECT 
                MIN(b.page_length) AS min_page_length,
                MAX(b.page_length) AS max_page_length,
                ROUND(AVG(b.page_length), 1) AS avg_page_length,
                COUNT(b.book_id) AS books_with_pages
            FROM Book b
            JOIN WrittenBy wb ON b.book_id = wb.book_id
            WHERE wb.author_id = %s AND b.user_id = %s AND b.page_length IS NOT NULL
        """, (author_id, user_id))
        page_stats = cursor.fetchone()

        print(f"Page stats: {page_stats}")

        # Only proceed if we have books with page lengths
        if page_stats and page_stats['books_with_pages'] > 0:
            min_page_length = page_stats['min_page_length']
            max_page_length = page_stats['max_page_length']

            # Title of shortest book
            cursor.execute("""
                SELECT b.title
                FROM Book b
                JOIN WrittenBy wb ON b.book_id = wb.book_id
                WHERE wb.author_id = %s AND b.user_id = %s AND b.page_length = %s
                LIMIT 1
            """, (author_id, user_id, min_page_length))
            min_book = cursor.fetchone()

            # Title of longest book
            cursor.execute("""
                SELECT b.title
                FROM Book b
                JOIN WrittenBy wb ON b.book_id = wb.book_id
                WHERE wb.author_id = %s AND b.user_id = %s AND b.page_length = %s
                LIMIT 1
            """, (author_id, user_id, max_page_length))
            max_book = cursor.fetchone()

            author_stats.append({
                "author_name": author["author_name"],
                "num_books": author["num_books"],
                "avg_page_length": page_stats["avg_page_length"],
                "min_book_title": min_book["title"] if min_book else "N/A",
                "min_page_length": min_page_length,
                "max_book_title": max_book["title"] if max_book else "N/A",
                "max_page_length": max_page_length,
            })
        else:
            # Author has books but none with page lengths
            author_stats.append({
                "author_name": author["author_name"],
                "num_books": author["num_books"],
                "avg_page_length": None,
                "min_book_title": "N/A",
                "min_page_length": None,
                "max_book_title": "N/A",
                "max_page_length": None,
            })

    print(f"Returning {len(author_stats)} author stats")
    return jsonify(author_stats)

if __name__ == "__main__":
    print("Starting Flask server...")
    print("Testing database connection...")
    
    try:
        conn = mysql.connector.connect(
            host=app.config['DB_HOST'],
            user=app.config['DB_USER'],
            password=app.config['DB_PASSWORD'],
            database=app.config['DB_DATABASE'],
            port=app.config['DB_PORT']
        )
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        print("✅ Database connection test successful")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        print("Check your config.py settings and MySQL server status")
    
    print("Available endpoints:")
    print("- GET  /                     - Display users (HTML)")
    print("- POST /add                  - Add user (Form)")
    print("- GET  /api/health           - Health check")
    print("- GET  /api/test_db          - Test database connection")
    print("- GET  /api/hello            - Hello world")
    print("- GET  /api/users            - Get all users (JSON)")
    print("- POST /api/users            - Add user (JSON)")
    print("- GET  /api/users/<id>       - Get single user (JSON)")
    print("\nServer starting on http://localhost:5000")
    
    app.run(port=5000, debug=True)