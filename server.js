const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sqlite3 = require('sqlite3').verbose();

const rootDir = __dirname;
const dataDir = path.join(rootDir, 'data');
const dbPath = path.join(dataDir, 'studio.db');
const sessions = new Map();
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
let db;

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}
function safe(value, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}
async function body(req) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > 8 * 1024 * 1024) throw Error('Payload is too large.');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString() || '{}');
  } catch {
    throw Error('Invalid request.');
  }
}
function passwordHash(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}
function validImageUrl(value) {
  return typeof value === 'string' && /^https?:\/\/.+\.(?:jpe?g|png|webp)(?:[?#].*)?$/i.test(value.trim());
}
function authenticated(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = token && sessions.get(token);
  if (!session || Date.now() - session.createdAt > 8 * 60 * 60 * 1000) {
    if (token) sessions.delete(token);
    return false;
  }
  return true;
}
function requireAdmin(req, res) {
  if (!authenticated(req)) {
    send(res, 401, { error: 'Please sign in.' });
    return false;
  }
  return true;
}
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
async function ensureSchema() {
  await run(`CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY, parentName TEXT, mobileNumber TEXT, email TEXT, babyName TEXT, babyAge TEXT, sessionType TEXT, sessionDate TEXT, message TEXT, status TEXT NOT NULL DEFAULT 'new', createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)`);
  await run(`CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY, title TEXT, category TEXT, alt TEXT, imageUrl TEXT, published INTEGER NOT NULL DEFAULT 1, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)`);
  await run(`CREATE TABLE IF NOT EXISTS admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, salt TEXT, hash TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)`);
}
async function migrateFromJson() {
  const jsonFile = path.join(dataDir, 'studio.json');
  try {
    const raw = await fsp.readFile(jsonFile, 'utf8');
    const parsed = JSON.parse(raw);
    const inquiryCount = await get('SELECT COUNT(*) AS count FROM inquiries');
    if (inquiryCount && inquiryCount.count === 0 && Array.isArray(parsed.inquiries)) {
      for (const inquiry of parsed.inquiries) {
        await run(`INSERT OR IGNORE INTO inquiries (id,parentName,mobileNumber,email,babyName,babyAge,sessionType,sessionDate,message,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, [inquiry.id, inquiry.parentName, inquiry.mobileNumber, inquiry.email, inquiry.babyName, inquiry.babyAge, inquiry.sessionType, inquiry.sessionDate, inquiry.message, inquiry.status || 'new', inquiry.createdAt || new Date().toISOString(), inquiry.createdAt || new Date().toISOString()]);
      }
    }
    const photoCount = await get('SELECT COUNT(*) AS count FROM photos');
    if (photoCount && photoCount.count === 0 && Array.isArray(parsed.photos)) {
      for (const photo of parsed.photos) {
        await run(`INSERT OR IGNORE INTO photos (id,title,category,alt,imageUrl,published,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)`, [photo.id, photo.title, photo.category, photo.alt, photo.imageUrl, photo.published ? 1 : 0, photo.createdAt || new Date().toISOString(), photo.createdAt || new Date().toISOString()]);
      }
    }
  } catch {
    // ignore missing or invalid JSON
  }
  const adminFile = path.join(dataDir, 'admin.json');
  try {
    const raw = await fsp.readFile(adminFile, 'utf8');
    const admin = JSON.parse(raw);
    if (admin.username && admin.hash) {
      await run(`INSERT OR IGNORE INTO admin_users (username,salt,hash,createdAt,updatedAt) VALUES (?,?,?,?,?)`, [admin.username, admin.salt, admin.hash, admin.createdAt || new Date().toISOString(), admin.createdAt || new Date().toISOString()]);
    }
  } catch {
    // ignore missing or invalid admin file
  }
}
async function initDb() {
  await fsp.mkdir(dataDir, { recursive: true });
  db = await new Promise((resolve, reject) => {
    const instance = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) reject(err);
      else resolve(instance);
    });
  });
  await ensureSchema();
  await migrateFromJson();
}
async function getAdminAccount(username) {
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) return { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD, environment: true };
  if (username) return await get('SELECT username, salt, hash FROM admin_users WHERE username = ? LIMIT 1', [username]);
  return await get('SELECT username, salt, hash FROM admin_users LIMIT 1');
}
async function adminConfigured() {
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) return true;
  const row = await get('SELECT 1 FROM admin_users LIMIT 1');
  return Boolean(row);
}
async function api(req, res, url) {
  if (req.method === 'POST' && url.pathname === '/api/inquiries') {
    const input = await body(req);
    const inquiry = {
      id: crypto.randomUUID(),
      parentName: safe(input.parentName, 100),
      mobileNumber: safe(input.mobileNumber, 40),
      email: safe(input.email, 120),
      babyName: safe(input.babyName, 100),
      babyAge: safe(input.babyAge, 50),
      sessionType: safe(input.sessionType, 50),
      sessionDate: safe(input.sessionDate, 20),
      message: safe(input.message, 2000),
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!inquiry.parentName || !inquiry.mobileNumber || !inquiry.email || !inquiry.sessionType) return send(res, 422, { error: 'Please complete all required fields.' });
    await run(`INSERT INTO inquiries (id,parentName,mobileNumber,email,babyName,babyAge,sessionType,sessionDate,message,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, [inquiry.id, inquiry.parentName, inquiry.mobileNumber, inquiry.email, inquiry.babyName, inquiry.babyAge, inquiry.sessionType, inquiry.sessionDate, inquiry.message, inquiry.status, inquiry.createdAt, inquiry.updatedAt]);
    return send(res, 201, { ok: true });
  }
  if (req.method === 'GET' && url.pathname === '/api/photos') {
    const photos = await all('SELECT id,title,category,alt,imageUrl,published,createdAt FROM photos WHERE published = 1 ORDER BY createdAt DESC');
    return send(res, 200, photos);
  }
  if (req.method === 'GET' && url.pathname === '/api/admin/status') {
    return send(res, 200, { configured: await adminConfigured() });
  }
  if (req.method === 'POST' && url.pathname === '/api/admin/setup') {
    if (await adminConfigured()) return send(res, 409, { error: 'An administrator account already exists.' });
    const input = await body(req);
    const username = safe(input.username, 50);
    const password = safe(input.password, 200);
    if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username)) return send(res, 422, { error: 'Use 3–50 letters, numbers, dots, dashes, or underscores for the username.' });
    if (password.length < 12) return send(res, 422, { error: 'Choose a password with at least 12 characters.' });
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = passwordHash(password, salt);
    const now = new Date().toISOString();
    await run(`INSERT INTO admin_users (username,salt,hash,createdAt,updatedAt) VALUES (?,?,?,?,?)`, [username, salt, hash, now, now]);
    return send(res, 201, { ok: true });
  }
  if (req.method === 'POST' && url.pathname === '/api/admin/login') {
    const input = await body(req);
    const username = safe(input.username, 50);
    const account = await getAdminAccount(username);
    if (!account) return send(res, 409, { error: 'Create the first administrator account before signing in.' });
    const valid = account.environment ? safe(input.password, 200) === account.password : crypto.timingSafeEqual(Buffer.from(passwordHash(safe(input.password, 200), account.salt), 'hex'), Buffer.from(account.hash, 'hex'));
    if (username !== account.username || !valid) return send(res, 401, { error: 'Invalid username or password.' });
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { createdAt: Date.now() });
    return send(res, 200, { token });
  }
  if (req.method === 'POST' && url.pathname === '/api/admin/logout') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) sessions.delete(token);
    return send(res, 200, { ok: true });
  }
  if (req.method === 'GET' && url.pathname === '/api/admin/dashboard') {
    if (!requireAdmin(req, res)) return;
    const inquiries = await all('SELECT * FROM inquiries ORDER BY createdAt DESC');
    const photos = await all('SELECT * FROM photos ORDER BY createdAt DESC');
    return send(res, 200, { inquiries, photos });
  }
  if (req.method === 'POST' && url.pathname === '/api/admin/photos') {
    if (!requireAdmin(req, res)) return;
    const input = await body(req);
    const imageUrl = safe(input.imageUrl, 1000);
    if (!validImageUrl(imageUrl)) return send(res, 422, { error: 'Enter a valid JPG, PNG, or WebP image URL.' });
    const photo = {
      id: crypto.randomUUID(),
      title: safe(input.title, 120) || 'Studio moment',
      category: safe(input.category, 50) || 'newborn',
      alt: safe(input.alt, 160) || 'Baby Studio portfolio photo',
      imageUrl,
      published: input.published !== false ? 1 : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await run(`INSERT INTO photos (id,title,category,alt,imageUrl,published,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)`, [photo.id, photo.title, photo.category, photo.alt, photo.imageUrl, photo.published, photo.createdAt, photo.updatedAt]);
    return send(res, 201, photo);
  }
  if (req.method === 'PATCH' && /^\/api\/admin\/inquiries\/[\w-]+$/.test(url.pathname)) {
    if (!requireAdmin(req, res)) return;
    const input = await body(req);
    const inquiryId = url.pathname.split('/').pop();
    const item = await get('SELECT * FROM inquiries WHERE id = ?', [inquiryId]);
    if (!item) return send(res, 404, { error: 'Inquiry not found.' });
    const status = ['new', 'contacted', 'booked', 'closed'].includes(input.status) ? input.status : item.status;
    await run('UPDATE inquiries SET status = ?, updatedAt = ? WHERE id = ?', [status, new Date().toISOString(), inquiryId]);
    const updated = await get('SELECT * FROM inquiries WHERE id = ?', [inquiryId]);
    return send(res, 200, updated);
  }
  if (req.method === 'PATCH' && /^\/api\/admin\/photos\/[\w-]+$/.test(url.pathname)) {
    if (!requireAdmin(req, res)) return;
    const input = await body(req);
    const photoId = url.pathname.split('/').pop();
    const photo = await get('SELECT * FROM photos WHERE id = ?', [photoId]);
    if (!photo) return send(res, 404, { error: 'Photo not found.' });
    const published = typeof input.published === 'boolean' ? (input.published ? 1 : 0) : photo.published;
    const title = typeof input.title === 'string' ? safe(input.title, 120) || photo.title : photo.title;
    const category = typeof input.category === 'string' ? safe(input.category, 50) || photo.category : photo.category;
    const alt = typeof input.alt === 'string' ? safe(input.alt, 160) || photo.alt : photo.alt;
    await run('UPDATE photos SET title = ?, category = ?, alt = ?, published = ?, updatedAt = ? WHERE id = ?', [title, category, alt, published, new Date().toISOString(), photoId]);
    const updated = await get('SELECT * FROM photos WHERE id = ?', [photoId]);
    return send(res, 200, updated);
  }
  if (req.method === 'DELETE' && /^\/api\/admin\/photos\/[\w-]+$/.test(url.pathname)) {
    if (!requireAdmin(req, res)) return;
    const photoId = url.pathname.split('/').pop();
    const result = await run('DELETE FROM photos WHERE id = ?', [photoId]);
    if (result.changes === 0) return send(res, 404, { error: 'Photo not found.' });
    return send(res, 200, { ok: true });
  }
  return send(res, 404, { error: 'Not found.' });
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    const relative = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const file = path.resolve(rootDir, relative);
    if (!file.startsWith(rootDir + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  } catch (error) {
    send(res, 500, { error: error.message || 'Server error.' });
  }
});
async function start() {
  await initDb();
  const port = Number(process.env.PORT || 4173);
  const host = process.env.HOST || '0.0.0.0';
  server.listen(port, host, () => console.log(`The Baby Studio running at http://${host}:${port}`));
}
start();
