import sqlite3
from datetime import datetime

DB_PATH = 'expensewise.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS receipts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vendor TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT,
            date TEXT NOT NULL,
            category TEXT,
            deductible INTEGER,
            notes TEXT,
            uploaded_at TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized.")
