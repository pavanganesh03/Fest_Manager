const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'supersecret_fest_key';

// Middleware
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
};

// Auth
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    try {
        const hash = bcrypt.hashSync(password, 10);
        const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hash);
        res.json({ id: result.lastInsertRowid, name, email, role: 'student' });
    } catch (err) {
        res.status(400).json({ error: 'Email already exists' });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Themes
app.get('/api/themes', (req, res) => {
    res.json(db.prepare('SELECT * FROM themes').all());
});

// Stalls
app.get('/api/stalls', (req, res) => {
    // Public: only approved
    const stalls = db.prepare(`
        SELECT s.*, t.name as theme_name, u.name as owner_name 
        FROM stalls s
        JOIN themes t ON s.theme_id = t.id
        JOIN users u ON s.owner_id = u.id
        WHERE s.status = 'approved'
    `).all();
    res.json(stalls);
});

app.get('/api/stalls/my', authenticate, (req, res) => {
    const stalls = db.prepare(`
        SELECT s.*, t.name as theme_name 
        FROM stalls s
        JOIN themes t ON s.theme_id = t.id
        WHERE s.owner_id = ?
    `).all(req.user.id);
    res.json(stalls);
});

app.get('/api/stalls/all', authenticate, requireAdmin, (req, res) => {
    const stalls = db.prepare(`
        SELECT s.*, t.name as theme_name, u.name as owner_name 
        FROM stalls s
        JOIN themes t ON s.theme_id = t.id
        JOIN users u ON s.owner_id = u.id
    `).all();
    res.json(stalls);
});

app.post('/api/stalls', authenticate, (req, res) => {
    const { name, description, theme_id } = req.body;
    if (!name || !description || !theme_id) return res.status(400).json({ error: 'Missing fields' });
    try {
        const result = db.prepare('INSERT INTO stalls (name, description, theme_id, owner_id) VALUES (?, ?, ?, ?)').run(name, description, theme_id, req.user.id);
        res.json({ id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/stalls/:id/approve', authenticate, requireAdmin, (req, res) => {
    db.prepare("UPDATE stalls SET status = 'approved' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
});
app.post('/api/stalls/:id/reject', authenticate, requireAdmin, (req, res) => {
    db.prepare("UPDATE stalls SET status = 'rejected' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
});

// Events
app.get('/api/events', (req, res) => {
    const events = db.prepare(`
        SELECT e.*, 
        (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id) as joined_count
        FROM events e
    `).all();
    res.json(events);
});

app.get('/api/events/my', authenticate, (req, res) => {
    const events = db.prepare(`
        SELECT e.* 
        FROM events e
        JOIN event_registrations r ON e.id = r.event_id
        WHERE r.user_id = ?
    `).all(req.user.id);
    res.json(events);
});

app.post('/api/events', authenticate, requireAdmin, (req, res) => {
    const { name, time, venue, capacity } = req.body;
    if (!name || !time || !venue || !capacity) return res.status(400).json({ error: 'Missing fields' });
    const result = db.prepare('INSERT INTO events (name, time, venue, capacity) VALUES (?, ?, ?, ?)').run(name, time, venue, capacity);
    res.json({ id: result.lastInsertRowid });
});

app.put('/api/events/:id', authenticate, requireAdmin, (req, res) => {
    const { name, time, venue, capacity } = req.body;
    if (!name || !time || !venue || !capacity) return res.status(400).json({ error: 'Missing fields' });
    db.prepare('UPDATE events SET name = ?, time = ?, venue = ?, capacity = ? WHERE id = ?').run(name, time, venue, capacity, req.params.id);
    res.json({ success: true });
});

app.post('/api/events/:id/join', authenticate, (req, res) => {
    const eventId = req.params.id;
    try {
        const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
        if (!event) return res.status(404).json({ error: 'Not found' });
        
        const joined = db.prepare('SELECT COUNT(*) as c FROM event_registrations WHERE event_id = ?').get(eventId).c;
        if (joined >= event.capacity) return res.status(400).json({ error: 'Event full' });
        
        db.prepare('INSERT INTO event_registrations (event_id, user_id) VALUES (?, ?)').run(eventId, req.user.id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: 'Already joined or error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
