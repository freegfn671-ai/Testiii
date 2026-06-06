import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

// Set up __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

app.use(express.json());

// Setup local uploads
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Setup static file serving for uploads
app.use("/uploads", express.static(UPLOADS_DIR));

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  }
});

// Setup local SQLite Database (No PostgreSQL/Prisma)
const dbPath = path.join(__dirname, "local.db");
const db = new Database(dbPath);

// Initialize simple tables
db.exec(`
  CREATE TABLE IF NOT EXISTS quests (
    id TEXT PRIMARY KEY,
    title TEXT,
    slug TEXT UNIQUE,
    city TEXT,
    district TEXT,
    address TEXT,
    company TEXT,
    shortDescription TEXT,
    fullDescription TEXT,
    category TEXT,
    tags TEXT,
    difficulty TEXT,
    fearLevel TEXT,
    duration INTEGER,
    playersMin INTEGER,
    playersMax INTEGER,
    ageLimit INTEGER,
    priceAmount REAL,
    priceType TEXT,
    currency TEXT,
    imageUrl TEXT,
    images TEXT,
    withActors INTEGER,
    wifi INTEGER,
    parking INTEGER,
    birthdayArea INTEGER,
    isActive INTEGER,
    isPopular INTEGER,
    isNew INTEGER,
    isVerified INTEGER,
    isQuestOfTheMonth INTEGER,
    lat REAL,
    lng REAL,
    rating REAL,
    reviewsCount INTEGER,
    ownerId TEXT,
    ownerName TEXT,
    createdAt INTEGER
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    questId TEXT,
    questTitle TEXT,
    userId TEXT,
    date TEXT,
    time TEXT,
    name TEXT,
    email TEXT,
    phone TEXT,
    participants INTEGER,
    totalPrice REAL,
    status TEXT,
    questOwnerId TEXT,
    questOwnerName TEXT,
    createdAt INTEGER
  );
`);

// API Routes

// Upload API
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image provided" });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// Quests API
app.get("/api/quests", (req, res) => {
  try {
    const quests = db.prepare("SELECT * FROM quests ORDER BY createdAt DESC").all();
    // Parse JSON fields
    quests.forEach(q => {
      if (typeof q.tags === "string") q.tags = JSON.parse(q.tags || "[]");
      if (typeof q.images === "string") q.images = JSON.parse(q.images || "[]");
      // convert numeric booleans
      q.withActors = !!q.withActors;
      q.wifi = !!q.wifi;
      q.parking = !!q.parking;
      q.birthdayArea = !!q.birthdayArea;
      q.isActive = !!q.isActive;
      q.isPopular = !!q.isPopular;
      q.isNew = !!q.isNew;
      q.isVerified = !!q.isVerified;
      q.isQuestOfTheMonth = !!q.isQuestOfTheMonth;
    });
    res.json(quests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quests" });
  }
});

app.post("/api/quests", (req, res) => {
  try {
    const data = req.body;
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    
    // Auth check normally here
    
    const stmt = db.prepare(`
      INSERT INTO quests (
        id, title, slug, city, district, address, company,
        shortDescription, fullDescription, category, tags,
        difficulty, fearLevel, duration, playersMin, playersMax,
        ageLimit, priceAmount, priceType, currency, imageUrl, images,
        withActors, wifi, parking, birthdayArea, isActive,
        isPopular, isNew, isVerified, isQuestOfTheMonth,
        lat, lng, rating, reviewsCount, ownerId, ownerName, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, data.title, data.slug, data.city, data.district, data.address, data.company,
      data.shortDescription, data.fullDescription, data.category, JSON.stringify(data.tags || []),
      data.difficulty, data.fearLevel, data.duration, data.playersMin, data.playersMax,
      data.ageLimit, data.priceAmount, data.priceType, data.currency, data.imageUrl, JSON.stringify(data.images || []),
      data.withActors ? 1 : 0, data.wifi ? 1 : 0, data.parking ? 1 : 0, data.birthdayArea ? 1 : 0, data.isActive ? 1 : 0,
      data.isPopular ? 1 : 0, data.isNew ? 1 : 0, data.isVerified ? 1 : 0, data.isQuestOfTheMonth ? 1 : 0,
      data.lat, data.lng, data.rating || 5, data.reviewsCount || 0, data.ownerId || null, data.ownerName || null, Date.now()
    );

    res.json({ id, ...data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create quest" });
  }
});

app.put("/api/quests/:id", (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const stmt = db.prepare(`
      UPDATE quests SET
        title=?, slug=?, city=?, district=?, address=?, company=?,
        shortDescription=?, fullDescription=?, category=?, tags=?,
        difficulty=?, fearLevel=?, duration=?, playersMin=?, playersMax=?,
        ageLimit=?, priceAmount=?, priceType=?, currency=?, imageUrl=?, images=?,
        withActors=?, wifi=?, parking=?, birthdayArea=?, isActive=?,
        isPopular=?, isNew=?, isVerified=?, isQuestOfTheMonth=?,
        lat=?, lng=?
      WHERE id=?
    `);

    stmt.run(
      data.title, data.slug, data.city, data.district, data.address, data.company,
      data.shortDescription, data.fullDescription, data.category, JSON.stringify(data.tags || []),
      data.difficulty, data.fearLevel, data.duration, data.playersMin, data.playersMax,
      data.ageLimit, data.priceAmount, data.priceType, data.currency, data.imageUrl, JSON.stringify(data.images || []),
      data.withActors ? 1 : 0, data.wifi ? 1 : 0, data.parking ? 1 : 0, data.birthdayArea ? 1 : 0, data.isActive ? 1 : 0,
      data.isPopular ? 1 : 0, data.isNew ? 1 : 0, data.isVerified ? 1 : 0, data.isQuestOfTheMonth ? 1 : 0,
      data.lat, data.lng, id
    );

    res.json({ id, ...data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update quest" });
  }
});

app.delete("/api/quests/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM quests WHERE id=?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete quest" });
  }
});

// Bookings
app.get("/api/bookings", (req, res) => {
  try {
    const userId = req.headers["x-user-id"]; // Client should pass
    const role = req.headers["x-user-role"];
    
    let bookings = [];
    if (role === "admin") {
      bookings = db.prepare("SELECT * FROM bookings ORDER BY createdAt DESC").all();
    } else if (role === "manager") {
      bookings = db.prepare("SELECT * FROM bookings WHERE questOwnerId=? ORDER BY createdAt DESC").all(userId);
    } else if (userId) {
      bookings = db.prepare("SELECT * FROM bookings WHERE userId=? ORDER BY createdAt DESC").all(userId);
    } else {
      bookings = db.prepare("SELECT * FROM bookings ORDER BY createdAt DESC").all();
    }
    
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

app.post("/api/bookings", (req, res) => {
  try {
    const data = req.body;
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    
    const stmt = db.prepare(`
      INSERT INTO bookings (id, questId, questTitle, userId, date, time, name, email, phone, participants, totalPrice, status, questOwnerId, questOwnerName, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id, data.questId, data.questTitle, data.userId || null, data.date, data.time,
      data.name, data.email, data.phone, data.participants, data.totalPrice,
      data.status || "pending", data.questOwnerId || null, data.questOwnerName || null, Date.now()
    );
    
    res.json({ id, ...data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

app.put("/api/bookings/:id", (req, res) => {
  try {
    const { status } = req.body;
    db.prepare("UPDATE bookings SET status=? WHERE id=?").run(status, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update booking" });
  }
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Note: express has a quirk where app.get('*', ...) should be used in prod
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
