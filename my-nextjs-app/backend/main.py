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

