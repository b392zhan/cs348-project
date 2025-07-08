from flask import Flask, jsonify, request, g, render_template
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import click

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

# @app.route('/api/books', methods=['POST'])
# def log_book_from_ui():
#     try:
#         data = request.get_json()
#         title = data.get('title')
#         author = data.get('author')
#         cover_url = data.get('coverUrl')

#         print("📘 Book added from UI:")
#         print(f"    Title: {title}")
#         print(f"    Author: {author}")
#         print(f"    Cover URL: {cover_url}")

#         return jsonify({
#             "status": "success",
#             "message": "Book received on backend"
#         }), 200
#     except Exception as e:
#         print(f"❌ Error receiving book data: {e}")
#         return jsonify({
#             "status": "error",
#             "message": str(e)
#         }), 500

# # @app.route('/api/books', methods=['POST'])
# # def log_book_from_ui():
#     try:
#         data = request.get_json()
#         title = data.get('title')
#         author_name = data.get('author')
#         cover_url = data.get('coverUrl')

#         if not title or not author_name:
#             return jsonify({"status": "error", "message": "Title and author are required"}), 400

#         db = get_db()
#         cursor = db.cursor()

#         # Step 1: Insert author if not exists
#         cursor.execute("SELECT id FROM authors WHERE name = %s", (author_name,))
#         author = cursor.fetchone()
#         if author:
#             author_id = author[0]
#         else:
#             cursor.execute("INSERT INTO authors (name) VALUES (%s)", (author_name,))
#             db.commit()
#             author_id = cursor.lastrowid

#         # Step 2: Insert book
#         cursor.execute(
#             "INSERT INTO books (title, author_id, cover_url) VALUES (%s, %s, %s)",
#             (title, author_id, cover_url)
#         )
#         db.commit()
#         book_id = cursor.lastrowid

#         cursor.close()

#         print(f"📚 New book added: '{title}' by {author_name} (ID: {book_id})")

#         return jsonify({
#             "status": "success",
#             "message": "Book added to database",
#             "book_id": book_id
#         }), 201

#     except Error as err:
#         print(f"❌ MySQL Error: {err}")
#         return jsonify({"status": "error", "message": str(err)}), 500
#     except Exception as e:
#         print(f"❌ Unexpected Error: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/books', methods=['POST'])
def log_book_from_ui():
    try:
        data = request.get_json()

        title = data.get('title')
        issue = data.get('issue')
        page_length = data.get('page_length')
        cover_url = data.get('cover_url')
        author_name = data.get('author')
        author_dob = data.get('author_dob')
        publisher_name = data.get('publisher')  # This must come from frontend now

        if not title or not author_name or not publisher_name:
            return jsonify({"status": "error", "message": "Title, author, and publisher are required"}), 400

        db = get_db()
        cursor = db.cursor()

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
            INSERT INTO Book (title, issue, page_length, cover_url)
            VALUES (%s, %s, %s, %s)
        """, (title, issue or None, page_length or None, cover_url or None))
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
        
        if not search_query:
            return get_all_books()
        
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        # Exact match only query
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
            WHERE b.title = %s
            GROUP BY b.book_id, b.title, b.issue, b.page_length, b.cover_url
            ORDER BY b.title
        """, (search_query,))
        
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

        # Default to ASC if invalid input
        if sort_order not in ('asc', 'desc'):
            sort_order = 'asc'

        db = get_db()
        cursor = db.cursor(dictionary=True)

        if not search_query:
            # If no search query, return all books sorted
            cursor.execute(f"""
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
                GROUP BY b.book_id, b.title, b.issue, b.page_length, b.cover_url
                ORDER BY b.title {sort_order.upper()}
            """)
        else:
            # If search query provided
            cursor.execute(f"""
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
                WHERE b.title = %s
                GROUP BY b.book_id, b.title, b.issue, b.page_length, b.cover_url
                ORDER BY b.title {sort_order.upper()}
            """, (search_query,))

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


@app.route('/api/books/page-range')
def filter_books_by_page_range():
    try:
        min_pages = request.args.get('min', type=int)
        max_pages = request.args.get('max', type=int)

        db = get_db()
        cursor = db.cursor(dictionary=True)

        query = """
            SELECT 
                b.book_id, b.title, b.issue, b.page_length, b.cover_url,
                GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') AS authors
            FROM Book b
            LEFT JOIN WrittenBy wb ON b.book_id = wb.book_id
            LEFT JOIN Author a ON wb.author_id = a.author_id
            WHERE b.page_length BETWEEN %s AND %s
            GROUP BY b.book_id
            ORDER BY b.page_length ASC
        """
        cursor.execute(query, (min_pages, max_pages))
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