// server.js (ESM, Express + sqlite3 only)
import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';

const app = express();
const PORT = process.env.PORT || 5050;

const __dirname = path.resolve();
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOAD_DIR = path.join(PUBLIC_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.static(PUBLIC_DIR));

// Tiny request logger
app.use((req, _res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// --- sqlite3 (no 'sqlite' wrapper) ---
const db = new sqlite3.Database(path.join(__dirname, 'trinkets.db'));
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS trinkets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      story TEXT,
      image_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Helpers
function saveDataUrlToFile(dataUrl) {
  const m = /^data:(image\/\w+);base64,/.exec(dataUrl || '');
  if (!m) throw new Error('Invalid image data URL');
  const ext = m[1].split('/')[1] || 'png';
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buf = Buffer.from(base64, 'base64');
  const filename = `trinket_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, buf);
  return `/uploads/${filename}`; // web path
}
function deleteFileSafe(relPath) {
  try {
    if (!relPath) return;
    const p = path.join(PUBLIC_DIR, relPath.replace(/^[\\/]/, ''));
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch (e) {
    console.warn('Could not delete file:', relPath, e?.message);
  }
}

// Promise wrappers for sqlite3
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this); // has lastID, changes
    });
  });
}
function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}
function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

// --- Routes ---
// Create
app.post('/api/trinkets', async (req, res) => {
  try {
    const { name = '', story = '', drawing } = req.body || {};
    if (!drawing) return res.status(400).json({ error: 'Missing drawing' });

    const imagePath = saveDataUrlToFile(drawing);
    const r = await runAsync(
      'INSERT INTO trinkets (name, story, image_path) VALUES (?, ?, ?)',
      [name.trim(), story.trim(), imagePath]
    );
    const row = await getAsync('SELECT * FROM trinkets WHERE id = ?', [r.lastID]);
    res.json(row);
  } catch (err) {
    console.error('POST /api/trinkets failed', err);
    res.status(500).json({ error: 'Failed to save trinket' });
  }
});

// List
app.get('/api/trinkets', async (_req, res) => {
  try {
    const rows = await allAsync(
      'SELECT * FROM trinkets ORDER BY id DESC LIMIT 200'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/trinkets failed', err);
    res.status(500).json({ error: 'Failed to fetch trinkets' });
  }
});

// Delete one
app.delete('/api/trinkets/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = await getAsync('SELECT * FROM trinkets WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ error: 'Not found' });

    deleteFileSafe(row.image_path);
    await runAsync('DELETE FROM trinkets WHERE id = ?', [id]);
    res.json({ success: true, deleted: id });
  } catch (err) {
    console.error('DELETE /api/trinkets/:id failed', err);
    res.status(500).json({ error: 'Failed to delete trinket' });
  }
});

// Delete all
app.delete('/api/trinkets', async (_req, res) => {
  try {
    const rows = await allAsync('SELECT image_path FROM trinkets');
    for (const r of rows) deleteFileSafe(r.image_path);
    await runAsync('DELETE FROM trinkets');
    res.json({ success: true, deletedAll: true });
  } catch (err) {
    console.error('DELETE /api/trinkets failed', err);
    res.status(500).json({ error: 'Failed to delete all trinkets' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});