import os
import sqlite3
import time
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename

app = Flask(__name__)
DB_NAME = "database.db"
UPLOAD_FOLDER = os.path.join("static", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

def init_db():
    conn = sqlite3.connect(DB_NAME)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            person_name TEXT NOT NULL,
            mobile_no TEXT NOT NULL,
            location TEXT NOT NULL,
            item_name TEXT NOT NULL,
            photo_path TEXT,
            submitted_to TEXT,
            status TEXT DEFAULT 'Active'
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def home_page():
    return render_template('home.html')

@app.route('/lost')
def lost_page():
    return render_template('lost.html')

@app.route('/found')
def found_page():
    return render_template('found.html')

@app.route('/api/items/<category>', methods=['GET'])
def get_items(category):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    items = conn.execute(
        'SELECT * FROM items WHERE category = ? ORDER BY id DESC', (category,)
    ).fetchall()
    conn.close()
    return jsonify([dict(row) for row in items])

@app.route('/api/items', methods=['POST'])
def add_item():
    category = request.form.get('category')
    person_name = request.form.get('person_name')
    mobile_no = request.form.get('mobile_no')
    location = request.form.get('location')
    item_name = request.form.get('item_name')
    submitted_to = request.form.get('submitted_to', '')

    photo_path = ""
    photo = request.files.get('photo')
    if photo and photo.filename != "":
        filename = f"{int(time.time())}_{secure_filename(photo.filename)}"
        photo.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        photo_path = f"/static/uploads/{filename}"

    conn = sqlite3.connect(DB_NAME)
    conn.execute('''
        INSERT INTO items (category, person_name, mobile_no, location, item_name, photo_path, submitted_to)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (category, person_name, mobile_no, location, item_name, photo_path, submitted_to))
    conn.commit()
    conn.close()
    return jsonify({"message": "Saved successfully"}), 201

@app.route('/api/items/<int:item_id>/resolve', methods=['PUT'])
def resolve_item(item_id):
    conn = sqlite3.connect(DB_NAME)
    conn.execute("UPDATE items SET status = 'Resolved' WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Resolved"})

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    conn = sqlite3.connect(DB_NAME)
    conn.execute("DELETE FROM items WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Deleted"})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)