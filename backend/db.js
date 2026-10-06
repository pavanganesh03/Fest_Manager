const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const db = new Database(path.join(__dirname, 'fest.db'));

const initDB = () => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student'
        );

        CREATE TABLE IF NOT EXISTS themes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
        );

        CREATE TABLE IF NOT EXISTS stalls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            theme_id INTEGER NOT NULL,
            owner_id INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            FOREIGN KEY(theme_id) REFERENCES themes(id),
            FOREIGN KEY(owner_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            time TEXT NOT NULL,
            venue TEXT NOT NULL,
            capacity INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS event_registrations (
            event_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            PRIMARY KEY(event_id, user_id),
            FOREIGN KEY(event_id) REFERENCES events(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);

    // Create admin if not exists
    const admin = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
    if (!admin) {
        const hash = bcrypt.hashSync('admin123', 10);
        db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run('Organizer', 'admin@fest.com', hash, 'admin');
    }

    // Create some default themes if empty
    const count = db.prepare("SELECT COUNT(*) as c FROM themes").get().c;
    if (count === 0) {
        const stmt = db.prepare("INSERT INTO themes (name, description) VALUES (?, ?)");
        stmt.run('Food & Beverages', 'Delicious treats and drinks');
        stmt.run('Gaming', 'Esports, board games, and fun');
        stmt.run('Tech & Innovation', 'Hardware projects and software demos');
        stmt.run('Merchandise', 'T-shirts, stickers, and art');
    }
};

initDB();

module.exports = db;
