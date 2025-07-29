from flask import Flask, jsonify, request, g, render_template
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import click
import random
from datetime import datetime
from datetime import timedelta, datetime


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
    

@app.route('/api/change_password', methods=['POST'])
def change_password():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not all([user_id, current_password, new_password]):
            return jsonify({
                "status": "error", 
                "message": "User ID, current password, and new password are required"
            }), 400
        
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        # Check if current password is correct
        cursor.execute("SELECT password FROM User WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({
                "status": "error", 
                "message": "User not found"
            }), 404
        
        if user['password'] != current_password:
            return jsonify({
                "status": "error", 
                "message": "Current password is incorrect"
            }), 401
        
        # Update password
        cursor.execute(
            "UPDATE User SET password = %s WHERE user_id = %s",
            (new_password, user_id)
        )
        db.commit()
        cursor.close()
        
        return jsonify({
            "status": "success", 
            "message": "Password updated successfully"
        }), 200
        
    except Error as err:
        return jsonify({
            "status": "error", 
            "message": f"Database error: {err}"
        }), 500
    except Exception as e:
        return jsonify({
            "status": "error", 
            "message": str(e)
        }), 500


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
        publisher_name = data.get('publisher')  

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


        # Fetch books matching search query for this user
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
            WHERE b.title LIKE %s AND b.user_id = %s
            GROUP BY b.book_id, b.title, b.issue, b.page_length, b.cover_url
            ORDER BY b.title
        """, (f"%{search_query}%", username))

        books = cursor.fetchall()

        # Fetch all starred book IDs for this user
        cursor.execute("SELECT book_id FROM Starred WHERE user_id = %s", (username,))
        starred_books = {row["book_id"] for row in cursor.fetchall()}

        cursor.close()

        formatted_books = []
        for book in books:
            formatted_books.append({
                "id": book["book_id"],
                "title": book["title"],
                "author": book["authors"] or "Unknown Author",
                "coverUrl": book["cover_url"] or "/placeholder.svg?height=192&width=128",
                "letter": book["title"][0].upper() if book["title"] else "A",
                "starred": book["book_id"] in starred_books
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
        
        cursor.execute("SELECT book_id FROM Starred WHERE user_id = %s", (username,))
        starred_books = {row["book_id"] for row in cursor.fetchall()}

        cursor.close()

        formatted_books = [{
            "id": b["book_id"],
            "title": b["title"],
            "author": b["authors"] or "Unknown Author",
            "coverUrl": b["cover_url"] or "/placeholder.svg?height=192&width=128",
            "letter": b["title"][0].upper() if b["title"] else "?",
            "starred": b["book_id"] in starred_books
            
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
        username = request.args.get('username', '').strip()
        book_id = data.get('book_id')
        starred = data.get('starred', True)

        if not username or not book_id:
            return jsonify({"status": "error", "message": "Missing user_id or book_id"}), 400

        db = get_db()
        cursor = db.cursor()

        # Insert or update the record (if it already exists)
        cursor.execute("""
            INSERT INTO Starred (user_id, book_id, starred)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE starred = VALUES(starred)
        """, (username, book_id, starred))

        db.commit()
        cursor.close()

        return jsonify({"status": "success", "message": "Book starred successfully"})

    except Exception as e:
        print(f"❌ Error starring book: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/unstar', methods=['DELETE'])
def unstar_book():
    try:
        username = request.args.get('username', '').strip()
        
        data = request.get_json()
        book_id = data.get('book_id')

        if not username or not book_id:
            return jsonify({"status": "error", "message": "Missing user_id or book_id"}), 400

        db = get_db()
        cursor = db.cursor()

        # Delete the star record for this user/book pair only
        cursor.execute(
            "DELETE FROM Starred WHERE user_id = %s AND book_id = %s",
            (username, book_id)
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
        
        cursor.execute("SELECT book_id FROM Starred WHERE user_id = %s", (username,))
        starred_books = {row["book_id"] for row in cursor.fetchall()}

        formatted_books = [{
            "id": b["book_id"],
            "title": b["title"],
            "author": b["authors"] or "Unknown",
            "coverUrl": b["cover_url"] or "/placeholder.svg?height=192&width=128",
            "letter": b["title"][0].upper() if b["title"] else "?",
            "starred": b["book_id"] in starred_books
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
            SELECT %s, %s, CURDATE(), %s
            FROM (SELECT 1) AS dummy
            WHERE NOT EXISTS (
                SELECT 1 FROM HasRead h2 
                WHERE h2.user_id = %s AND h2.book_id = %s
                HAVING COUNT(*) > 0
            ) OR EXISTS (
                SELECT 1 FROM HasRead h3 
                WHERE h3.user_id = %s AND h3.book_id = %s
                HAVING COUNT(*) = 0
            )
        """, (user_id, book_id, review, user_id, book_id, user_id, book_id))

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

    # Enhanced SQL with CTE while selecting exactly the same columns
    cursor.execute("""
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
            WHERE u.user_id = %s
        )
        SELECT book_id, title, issue, page_length, review, date
        FROM UserBooks
    """, (username,))

    results = cursor.fetchall()
    return jsonify(results)

@app.route('/api/hasread/review', methods=['PUT'])
def update_review():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'user_id' not in data or 'book_id' not in data:
            return jsonify({'error': 'Missing required fields: user_id and book_id'}), 400
        
        user_id = data['user_id']
        book_id = data['book_id']
        review = data.get('review', '')  # Review can be empty
        
        # Connect to database
        connection = get_db()
        cursor = connection.cursor()
        
        # Enhanced update query with CTE while maintaining exact same functionality
        update_query = """
        WITH UpdateTarget AS (
            SELECT user_id, book_id
            FROM HasRead
            WHERE user_id = %s AND book_id = %s
        )
        UPDATE HasRead h
        JOIN UpdateTarget ut ON h.user_id = ut.user_id AND h.book_id = ut.book_id
        SET h.review = %s
        """
        
        cursor.execute(update_query, (user_id, book_id, review))
        connection.commit()
        
        # Check if any rows were affected
        if cursor.rowcount == 0:
            return jsonify({'error': 'No matching record found or no changes made'}), 404
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Review updated successfully',
            'user_id': user_id,
            'book_id': book_id,
            'review': review
        }), 200
        
    except mysql.connector.Error as db_error:
        return jsonify({'error': f'Database error: {str(db_error)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500



@app.route("/api/reading-stats")
def reading_stats():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user ID"}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Enhanced query with CTEs, window functions, and recursive-like logic
    query = """
        WITH RECURSIVE UserReadingData AS (
            -- Base case: Get all user's reading data with rankings
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
            WHERE hr.user_id = %s
            
            UNION ALL
            
            -- Recursive case: Create depth levels for complex aggregation
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
            WHERE urd.depth_level < 2  -- Limit recursion depth
        ),
        AuthorAnalysis AS (
            -- CTE for author preference analysis with window functions
            SELECT 
                a.author_id,
                a.name,
                COUNT(*) as books_by_author,
                RANK() OVER (ORDER BY COUNT(*) DESC) as author_rank,
                DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) as author_dense_rank
            FROM UserReadingData urd
            JOIN WrittenBy wb ON urd.book_id = wb.book_id
            JOIN Author a ON a.author_id = wb.author_id
            WHERE urd.depth_level = 1  -- Use only base level data
            GROUP BY a.author_id, a.name
        ),
        BookSequence AS (
            -- CTE for first and latest book identification
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
            -- CTE for page statistics with advanced calculations
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
        FROM PageStats ps
    """

    cursor.execute(query, (user_id,))
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



@app.route("/api/most-read-book")
def most_read_book():
    year = request.args.get("year")
    if not year:
        return jsonify({"error": "Missing year parameter"}), 400

    try:
        year = int(year)
    except ValueError:
        return jsonify({"error": "Invalid year format"}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)

    print(f"Finding most read book for year {year}")

    # Create the view if it doesn't exist
    cursor.execute("""
        CREATE OR REPLACE VIEW MostReadBookView AS
        SELECT 
            b.book_id,
            b.title,
            COUNT(h.hasread_id) AS read_count
        FROM HasRead h
        JOIN Book b ON b.book_id = h.book_id
        GROUP BY b.book_id, b.title
    """)
    
    # Get the most read book using the view
    cursor.execute("""
        SELECT 
            v.book_id,
            v.title,
            v.read_count
        FROM MostReadBookView v
        JOIN HasRead h ON v.book_id = h.book_id
        WHERE YEAR(h.date) = %s
        ORDER BY v.read_count DESC
        LIMIT 1
    """, (year,))
    
    most_read = cursor.fetchone()

    if not most_read:
        print(f"No books found for year {year}")
        return jsonify({
            "book": None,
            "year": year,
            "message": f"No books were read in {year}"
        })

    # Process the result
    book_data = {
        "book_id": most_read["book_id"],
        "title": most_read["title"],
        "read_count": most_read["read_count"]
    }

    print(f"Most read book: {most_read['title']} with {most_read['read_count']} reads")
    
    return jsonify({
        "book": book_data,
        "year": year
    })


@app.route("/api/most-read-book/available-years")
def available_years_for_most_read():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT DISTINCT YEAR(date) as year
        FROM HasRead
        WHERE date IS NOT NULL
        ORDER BY year DESC
    """)
    
    years = cursor.fetchall()
    year_list = [row['year'] for row in years] if years else []
    
    if not year_list:
        current_year = datetime.now().year
        year_list = [current_year, current_year - 1, current_year - 2]
    
    print(f"Available years for most read books: {year_list}")
    
    return jsonify({
        "years": year_list
    })


@app.route("/api/reading_challenges")
def get_reading_challenges():
    
    user_id = request.args.get("user_id")
    
    
    if not user_id:
        return jsonify({"status": "error", "message": "Missing user_id"}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)
    

    # Challenge 1: Read 12 books this year (using CTE with window functions)
    current_year = datetime.now().year
    
    cursor.execute("""
        WITH yearly_reads AS (
            SELECT 
                user_id,
                book_id,
                date,
                YEAR(date) as read_year,
                ROW_NUMBER() OVER (PARTITION BY user_id, YEAR(date) ORDER BY date) as book_sequence
            FROM HasRead
            WHERE user_id = %s
        ),
        year_aggregation AS (
            SELECT 
                user_id,
                read_year,
                COUNT(*) as total_books,
                MAX(book_sequence) as max_sequence
            FROM yearly_reads
            WHERE read_year = %s
            GROUP BY user_id, read_year
            HAVING COUNT(*) >= 0
        )
        SELECT 
            COALESCE(SUM(total_books), 0) as 'COUNT(*)'
        FROM year_aggregation
        WHERE user_id = %s AND read_year = %s
    """, (user_id, current_year, user_id, current_year))
    
    print("Executing:", user_id, current_year)

    result = cursor.fetchone()
    print("Raw fetchone() result (books read):", result)
    
    books_read_this_year = result['COUNT(*)']

    # Challenge 2: Read 3 books by the same author (using recursive CTE and window functions)
    cursor.execute("""
        WITH RECURSIVE author_books AS (
            -- Base case: Get all user's books with authors
            SELECT 
                hr.user_id,
                hr.book_id,
                wb.author_id,
                1 as book_count,
                hr.book_id as first_book_id
            FROM HasRead hr
            JOIN WrittenBy wb ON hr.book_id = wb.book_id
            WHERE hr.user_id = %s
            
            UNION ALL
            
            -- Recursive case: Count books by same author
            SELECT 
                ab.user_id,
                hr2.book_id,
                ab.author_id,
                ab.book_count + 1,
                ab.first_book_id
            FROM author_books ab
            JOIN HasRead hr2 ON ab.user_id = hr2.user_id
            JOIN WrittenBy wb2 ON hr2.book_id = wb2.book_id
            WHERE wb2.author_id = ab.author_id 
            AND hr2.book_id > ab.book_id
            AND ab.book_count < 100  -- Prevent infinite recursion
        ),
        author_counts_cte AS (
            SELECT 
                author_id,
                COUNT(DISTINCT book_id) as author_count,
                DENSE_RANK() OVER (ORDER BY COUNT(DISTINCT book_id) DESC) as author_rank
            FROM (
                SELECT DISTINCT user_id, book_id, author_id 
                FROM author_books
            ) unique_books
            GROUP BY author_id
        ),
        max_count_cte AS (
            SELECT 
                author_count,
                ROW_NUMBER() OVER (ORDER BY author_count DESC) as rn
            FROM author_counts_cte
            WHERE author_rank = 1
        )
        SELECT 
            COALESCE(MAX(author_count), 0) as 'MAX(author_count)'
        FROM max_count_cte
        WHERE rn = 1
    """, (user_id,))
    result = cursor.fetchone()
    
    max_books_by_single_author = (result and result['MAX(author_count)']) or 0

    # Challenge 3: Read 5000+ pages (using multiple CTEs and window functions)
    cursor.execute("""
        WITH user_books AS (
            SELECT DISTINCT
                hr.user_id,
                hr.book_id,
                b.page_length,
                ROW_NUMBER() OVER (PARTITION BY hr.user_id ORDER BY hr.date) as read_order
            FROM HasRead hr
            JOIN Book b ON hr.book_id = b.book_id
            WHERE hr.user_id = %s
        ),
        page_calculations AS (
            SELECT 
                user_id,
                book_id,
                page_length,
                SUM(page_length) OVER (PARTITION BY user_id ORDER BY read_order) as running_total,
                CASE 
                    WHEN page_length IS NOT NULL THEN page_length
                    ELSE 0 
                END as safe_page_length
            FROM user_books
        ),
        final_sum AS (
            SELECT 
                user_id,
                SUM(DISTINCT safe_page_length) as total_pages,
                COUNT(DISTINCT book_id) as total_books,
                AVG(safe_page_length) as avg_pages_per_book
            FROM page_calculations
            WHERE safe_page_length > 0
            GROUP BY user_id
            HAVING SUM(DISTINCT safe_page_length) >= 0
        )
        SELECT 
            COALESCE(total_pages, 0) as 'SUM(Book.page_length)'
        FROM final_sum
        WHERE user_id = %s
    """, (user_id, user_id))
    result = cursor.fetchone()
    
    total_pages_read = (result and result['SUM(Book.page_length)']) or 0

    print(books_read_this_year)
    print(max_books_by_single_author)
    print(total_pages_read)
    cursor.close()

    # Return boolean completion status + progress values (optional)
    return jsonify({
        "status": "success",
        "challenges": {
            "read_12_books_this_year": {
                "completed": books_read_this_year >= 12,
                "progress": books_read_this_year
            },
            "read_3_books_by_same_author": {
                "completed": max_books_by_single_author >= 3,
                "progress": max_books_by_single_author
            },
            "read_5000_pages": {
                "completed": total_pages_read >= 5000,
                "progress": total_pages_read
            }
        }
    })


@app.route("/api/follow", methods=["POST"])
def follow_user():
    data = request.get_json()
    follower_id = data.get("follower_id")
    followee_id = data.get("followee_id")

    if not follower_id or not followee_id:
        return jsonify({"status": "error", "message": "Missing user IDs"}), 400
    if follower_id == followee_id:
        return jsonify({"status": "error", "message": "Cannot follow yourself"}), 400

    try:
        db = get_db()
        cursor = db.cursor()

        # Check if already following
        cursor.execute("""
            SELECT * FROM Follows WHERE follower_id = %s AND followee_id = %s
        """, (follower_id, followee_id))
        if cursor.fetchone():
            cursor.close()
            return jsonify({"status": "error", "message": "Already following this user"}), 409

        # Insert follow record
        cursor.execute("""
            INSERT INTO Follows (follower_id, followee_id)
            VALUES (%s, %s)
        """, (follower_id, followee_id))
        db.commit()
        cursor.close()

        return jsonify({"status": "success", "message": "Followed successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/unfollow", methods=["POST"])
def unfollow_user():
    data = request.get_json()
    follower_id = data.get("follower_id")
    followee_id = data.get("followee_id")

    if not follower_id or not followee_id:
        return jsonify({"status": "error", "message": "Missing user IDs"}), 400

    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("""
            DELETE FROM Follows WHERE follower_id = %s AND followee_id = %s
        """, (follower_id, followee_id))
        
        if cursor.rowcount == 0:
            cursor.close()
            return jsonify({"status": "error", "message": "You are not following this user"}), 404
            
        db.commit()
        cursor.close()

        return jsonify({"status": "success", "message": "Unfollowed successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/following", methods=["GET"])
def get_following():
    """Get users that the current user is following"""
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"status": "error", "message": "Missing user_id"}), 400

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT u.user_id, u.username, u.name
            FROM Follows f
            JOIN User u ON f.followee_id = u.user_id
            WHERE f.follower_id = %s
        """, (user_id,))
        following_users = cursor.fetchall()
        cursor.close()

        return jsonify({"status": "success", "following": following_users}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/users-to-follow", methods=["GET"])
def get_users_to_follow():
    """Get suggested users that the current user can follow"""
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"status": "error", "message": "Missing user_id"}), 400

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        # Get users that the current user is not following (excluding themselves)
        cursor.execute("""
            SELECT u.user_id, u.username, u.name,
                   CASE WHEN f.followee_id IS NOT NULL THEN TRUE ELSE FALSE END as isFollowing
            FROM User u
            LEFT JOIN Follows f ON u.user_id = f.followee_id AND f.follower_id = %s
            WHERE u.user_id != %s
            ORDER BY u.username
            LIMIT 20
        """, (user_id, user_id))
        
        users = cursor.fetchall()
        cursor.close()
        
        # Convert boolean for JSON serialization
        for user in users:
            user['isFollowing'] = bool(user['isFollowing'])

        return jsonify({"status": "success", "users": users}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/search-users", methods=["GET"])
def search_users():
    """Search for users by username or user ID"""
    query = request.args.get("query")
    current_user_id = request.args.get("current_user_id")
    
    if not query:
        return jsonify({"status": "error", "message": "Missing search query"}), 400
    if not current_user_id:
        return jsonify({"status": "error", "message": "Missing current_user_id"}), 400

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        # Search by username or user_id, excluding current user
        if query.isdigit():
            # Search by user ID
            cursor.execute("""
                SELECT u.user_id, u.username, u.name,
                       CASE WHEN f.followee_id IS NOT NULL THEN TRUE ELSE FALSE END as isFollowing
                FROM User u
                LEFT JOIN Follows f ON u.user_id = f.followee_id AND f.follower_id = %s
                WHERE u.user_id = %s AND u.user_id != %s
            """, (current_user_id, query, current_user_id))
        else:
            # Search by username (partial match)
            search_term = f"%{query}%"
            cursor.execute("""
                SELECT u.user_id, u.username, u.name,
                       CASE WHEN f.followee_id IS NOT NULL THEN TRUE ELSE FALSE END as isFollowing
                FROM User u
                LEFT JOIN Follows f ON u.user_id = f.followee_id AND f.follower_id = %s
                WHERE (u.username LIKE %s OR u.name LIKE %s) AND u.user_id != %s
                ORDER BY u.username
                LIMIT 10
            """, (current_user_id, search_term, search_term, current_user_id))
        
        users = cursor.fetchall()
        cursor.close()
        
        # Convert boolean for JSON serialization
        for user in users:
            user['isFollowing'] = bool(user['isFollowing'])

        return jsonify({"status": "success", "users": users}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/user", methods=["GET"])
def get_user_by_id():
    """Get user information by user ID"""
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"status": "error", "message": "Missing user_id"}), 400

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT user_id, name, username FROM User WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        cursor.close()

        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404

        return jsonify({"status": "success", "user": user})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    

@app.route("/api/feed", methods=["GET"])
def get_user_feed():
    """Get the reading feed for a user - shows latest books read by people they follow"""
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"status": "error", "message": "Missing user_id"}), 400

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        # Get the latest book read by each user that the current user follows
        # This query gets the most recent HasRead entry for each followed user
        cursor.execute("""
            SELECT 
                hr.hasread_id,
                hr.user_id,
                u.username,
                u.name,
                hr.book_id,
                b.title as book_title,
                b.cover_url,
                hr.date,
                hr.review,
                b.page_length
            FROM HasRead hr
            INNER JOIN (
                -- Subquery to get the most recent hasread_id for each user that we follow
                SELECT 
                    hr2.user_id,
                    MAX(hr2.hasread_id) as latest_hasread_id
                FROM HasRead hr2
                INNER JOIN Follows f ON hr2.user_id = f.followee_id
                WHERE f.follower_id = %s
                GROUP BY hr2.user_id
            ) latest ON hr.hasread_id = latest.latest_hasread_id
            INNER JOIN User u ON hr.user_id = u.user_id
            INNER JOIN Book b ON hr.book_id = b.book_id
            ORDER BY hr.date DESC, hr.hasread_id DESC
            LIMIT 50
        """, (user_id,))
        
        feed_items = cursor.fetchall()
        cursor.close()

        # Convert date objects to strings for JSON serialization
        for item in feed_items:
            if item['date']:
                item['date'] = item['date'].strftime('%Y-%m-%d')

        return jsonify({"status": "success", "feed": feed_items}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/feed/all", methods=["GET"])
def get_all_reading_activity():
    """Get all recent reading activity from people the user follows (not just latest per person)"""
    user_id = request.args.get("user_id")
    limit = request.args.get("limit", 30)  # Default to 30 items
    
    if not user_id:
        return jsonify({"status": "error", "message": "Missing user_id"}), 400

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        # Get all recent reading activity from followed users
        cursor.execute("""
            SELECT 
                hr.hasread_id,
                hr.user_id,
                u.username,
                u.name,
                hr.book_id,
                b.title as book_title,
                b.cover_url,
                hr.date,
                hr.review,
                b.page_length
            FROM HasRead hr
            INNER JOIN Follows f ON hr.user_id = f.followee_id
            INNER JOIN User u ON hr.user_id = u.user_id
            INNER JOIN Book b ON hr.book_id = b.book_id
            WHERE f.follower_id = %s
            ORDER BY hr.date DESC, hr.hasread_id DESC
            LIMIT %s
        """, (user_id, limit))
        
        feed_items = cursor.fetchall()
        cursor.close()

        # Convert date objects to strings for JSON serialization
        for item in feed_items:
            if item['date']:
                item['date'] = item['date'].strftime('%Y-%m-%d')

        return jsonify({"status": "success", "feed": feed_items}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/feed/user/<int:target_user_id>", methods=["GET"])
def get_user_reading_history(target_user_id):
    """Get reading history for a specific user (useful for profile pages)"""
    current_user_id = request.args.get("current_user_id")
    limit = request.args.get("limit", 20)
    
    if not current_user_id:
        return jsonify({"status": "error", "message": "Missing current_user_id"}), 400

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        # Check if current user follows target user or if it's their own profile
        if str(current_user_id) != str(target_user_id):
            cursor.execute("""
                SELECT 1 FROM Follows 
                WHERE follower_id = %s AND followee_id = %s
            """, (current_user_id, target_user_id))
            
            if not cursor.fetchone():
                cursor.close()
                return jsonify({"status": "error", "message": "You can only view reading history of users you follow"}), 403

        # Get reading history for the target user
        cursor.execute("""
            SELECT 
                hr.hasread_id,
                hr.user_id,
                u.username,
                u.name,
                hr.book_id,
                b.title as book_title,
                b.cover_url,
                hr.date,
                hr.review,
                b.page_length
            FROM HasRead hr
            INNER JOIN User u ON hr.user_id = u.user_id
            INNER JOIN Book b ON hr.book_id = b.book_id
            WHERE hr.user_id = %s
            ORDER BY hr.date DESC, hr.hasread_id DESC
            LIMIT %s
        """, (target_user_id, limit))
        
        reading_history = cursor.fetchall()
        cursor.close()

        # Convert date objects to strings for JSON serialization
        for item in reading_history:
            if item['date']:
                item['date'] = item['date'].strftime('%Y-%m-%d')

        return jsonify({"status": "success", "reading_history": reading_history}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/admin/delete-user', methods=['DELETE'])
def delete_user():
    """Delete a user and all associated books"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'status': 'error', 'message': 'User ID is required'}), 400
        
        # Convert to int to ensure it's a valid user_id
        try:
            user_id = int(user_id)
        except ValueError:
            return jsonify({'status': 'error', 'message': 'Invalid user ID format'}), 400
        
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        # First, check if user exists
        cursor.execute("SELECT username FROM User WHERE user_id = %s", (user_id,))
        user_result = cursor.fetchone()
        
        if not user_result:
            cursor.close()
            return jsonify({'status': 'error', 'message': f'User with ID {user_id} not found'}), 404
        
        username = user_result['username']
        
        # Check if trying to delete admin (optional safety check)
        if username == 'admin':
            cursor.close()
            return jsonify({'status': 'error', 'message': 'Cannot delete admin user'}), 403
        
        # Delete user (books will be deleted automatically due to CASCADE)
        cursor.execute("DELETE FROM User WHERE user_id = %s", (user_id,))
        
        # Check if any rows were affected
        if cursor.rowcount == 0:
            cursor.close()
            return jsonify({'status': 'error', 'message': 'Failed to delete user'}), 500
        
        db.commit()
        cursor.close()
        
        return jsonify({
            'status': 'success',
            'message': f'User {username} (ID: {user_id}) and all associated books deleted successfully',
            'deleted_user_id': user_id,
            'deleted_username': username
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Updated get all users endpoint
@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    """Get all users with their book counts for admin panel"""
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        # Get all users with basic info (excluding admin)
        cursor.execute("""
            SELECT u.user_id, u.username, u.name, u.age, 
                   COUNT(b.book_id) as book_count
            FROM User u 
            LEFT JOIN Book b ON u.user_id = b.user_id 
            WHERE u.username != 'admin'
            GROUP BY u.user_id, u.username, u.name, u.age
            ORDER BY u.user_id
        """)
        users = cursor.fetchall()
        cursor.close()
        
        # Convert count to int for JSON serialization
        for user in users:
            user['book_count'] = int(user['book_count'])
        
        return jsonify({'status': 'success', 'users': users}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Optional: Get user statistics for dashboard
@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    """Get comprehensive statistics for the admin dashboard"""
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        # Total users (excluding admin)
        cursor.execute("SELECT COUNT(*) as total_users FROM User WHERE username != 'admin'")
        user_count = cursor.fetchone()['total_users']
        
        # Total books
        cursor.execute("SELECT COUNT(*) as total_books FROM Book")
        book_count = cursor.fetchone()['total_books']
        
        # Top 5 users with most books
        cursor.execute("""
            SELECT u.username, u.name, COUNT(b.book_id) as book_count
            FROM User u 
            LEFT JOIN Book b ON u.user_id = b.user_id 
            WHERE u.username != 'admin'
            GROUP BY u.user_id, u.username, u.name
            ORDER BY book_count DESC
            LIMIT 5
        """)
        top_users = cursor.fetchall()

        # Total reads (entries in HasRead)
        cursor.execute("SELECT COUNT(*) AS total_reads FROM HasRead")
        total_reads = cursor.fetchone()['total_reads']

        # Unique books read (distinct book_id)
        cursor.execute("SELECT COUNT(DISTINCT book_id) AS unique_books_read FROM HasRead")
        unique_books_read = cursor.fetchone()['unique_books_read']
        
        cursor.close()
        
        return jsonify({
            'status': 'success',
            'stats': {
                'total_users': int(user_count),
                'total_books': int(book_count),
                'total_reads': int(total_reads),
                'unique_books_read': int(unique_books_read),
                'top_users': top_users
            }
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/admin/analytics/weekly-reads', methods=['GET'])
def get_weekly_reads():
    """Get the number of books read by all users for each day in the past week"""
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        # Use UTC timezone to avoid timezone issues
        from datetime import datetime, timedelta, timezone
        
        # Get current UTC date
        utc_now = datetime.now(timezone.utc)
        end_date = utc_now.date()
        start_date = end_date - timedelta(days=6)  # 7 days total including today
        
        print(f"Debug: Date range from {start_date} to {end_date}")  # Debug log
        
        # Query to get reading counts by date for the past 7 days
        # Using DATE() function to ensure we're grouping by date regardless of time
        cursor.execute("""
            SELECT 
                DATE(date) as read_date,
                COUNT(*) as books_read
            FROM HasRead 
            WHERE DATE(date) BETWEEN %s AND %s
            GROUP BY DATE(date)
            ORDER BY DATE(date) ASC
        """, (start_date, end_date))
        
        results = cursor.fetchall()
        
        print(f"Debug: Database results: {results}")  # Debug log
        
        # Create a complete 7-day range with zero counts for missing days
        date_counts = {}
        for row in results:
            # Handle both date and datetime objects
            if hasattr(row['read_date'], 'strftime'):
                date_key = row['read_date'].strftime('%Y-%m-%d')
            else:
                date_key = str(row['read_date'])
            date_counts[date_key] = row['books_read']
        
        print(f"Debug: Date counts: {date_counts}")  # Debug log
        
        weekly_reads = []
        current_date = start_date
        for i in range(7):
            date_str = current_date.strftime('%Y-%m-%d')
            count = date_counts.get(date_str, 0)
            weekly_reads.append({
                'date': date_str,
                'books_read': count
            })
            print(f"Debug: {date_str} -> {count} books")  # Debug log
            current_date += timedelta(days=1)
        
        cursor.close()
        
        return jsonify({
            'status': 'success',
            'weekly_reads': weekly_reads,
            'date_range': {
                'start': start_date.strftime('%Y-%m-%d'),
                'end': end_date.strftime('%Y-%m-%d')
            },
            'debug_info': {
                'server_timezone': str(utc_now.astimezone().tzinfo),
                'utc_date': end_date.strftime('%Y-%m-%d'),
                'raw_db_results': len(results)
            }
        }), 200
        
    except Exception as e:
        print(f"Error in get_weekly_reads: {str(e)}")  # Debug log
        return jsonify({'status': 'error', 'message': str(e)}), 500
    
    
@app.route('/api/admin/delete-book', methods=['DELETE'])
def delete_book():
    """Delete a specific book by book_id and user_id"""
    try:
        data = request.get_json()
        book_id = data.get('book_id')
        user_id = data.get('user_id')
        
        # Validate input
        if not book_id or not user_id:
            return jsonify({
                'status': 'error',
                'message': 'Both book_id and user_id are required'
            }), 400
        
        # Convert to integers to validate
        try:
            book_id = int(book_id)
            user_id = int(user_id)
        except ValueError:
            return jsonify({
                'status': 'error',
                'message': 'Book ID and User ID must be valid numbers'
            }), 400
        
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        # First, check if the book exists and belongs to the specified user
        cursor.execute("""
            SELECT book_id, title, user_id 
            FROM Book 
            WHERE book_id = %s AND user_id = %s
        """, (book_id, user_id))
        
        book = cursor.fetchone()
        
        if not book:
            cursor.close()
            return jsonify({
                'status': 'error',
                'message': f'Book with ID {book_id} not found for user {user_id}'
            }), 404
        
        book_title = book['title']
        
        # Delete the book (this will also cascade delete from HasRead table if configured)
        cursor.execute("DELETE FROM Book WHERE book_id = %s AND user_id = %s", (book_id, user_id))
        
        # Check if the deletion was successful
        if cursor.rowcount == 0:
            cursor.close()
            return jsonify({
                'status': 'error',
                'message': 'Failed to delete the book'
            }), 500
        
        # Commit the transaction
        db.commit()
        cursor.close()
        
        return jsonify({
            'status': 'success',
            'message': f'Book "{book_title}" (ID: {book_id}) successfully deleted from user {user_id}\'s library'
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500    
    

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