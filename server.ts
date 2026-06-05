import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import fs from "fs";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-local-dev-123";

// Initialize SQLite Database
const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}
const db = new Database(path.join(dbDir, "database.sqlite"));

// Create Quests table
db.exec(`
  CREATE TABLE IF NOT EXISTS quests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE,
    title TEXT,
    city TEXT,
    district TEXT,
    address TEXT,
    company TEXT,
    shortDescription TEXT,
    fullDescription TEXT,
    category TEXT,
    tags TEXT,
    duration INTEGER,
    playersMin INTEGER,
    playersMax INTEGER,
    ageLimit INTEGER,
    priceAmount INTEGER,
    priceFrom INTEGER,
    priceType TEXT,
    pricePerTeam BOOLEAN,
    currency TEXT,
    imageUrl TEXT,
    images TEXT, -- JSON array
    difficulty TEXT,
    fearLevel TEXT,
    withActors BOOLEAN,
    wifi BOOLEAN,
    parking BOOLEAN,
    birthdayArea BOOLEAN,
    isActive BOOLEAN,
    isPopular BOOLEAN,
    isNew BOOLEAN,
    rating REAL,
    reviewsCount INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    questId INTEGER,
    questName TEXT,
    date TEXT,
    time TEXT,
    name TEXT,
    phone TEXT,
    email TEXT,
    participants INTEGER,
    totalPrice INTEGER,
    status TEXT DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS favorites (
    userId TEXT,
    questId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(userId, questId)
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    password TEXT,
    role TEXT DEFAULT 'user',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  try {
    db.exec("ALTER TABLE quests ADD COLUMN difficulty TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE quests ADD COLUMN fearLevel TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE users ADD COLUMN password TEXT;");
  } catch (e) {}

  try {
    db.exec("ALTER TABLE quests ADD COLUMN ownerId TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE quests ADD COLUMN ownerName TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE quests ADD COLUMN ownerEmail TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE quests ADD COLUMN createdByRole TEXT;");
  } catch (e) {}
  
  try {
    db.exec("ALTER TABLE bookings ADD COLUMN questOwnerId TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE bookings ADD COLUMN questOwnerName TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE bookings ADD COLUMN userId TEXT;");
  } catch (e) {}

  try {
    db.exec("ALTER TABLE users ADD COLUMN phone TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE users ADD COLUMN company TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE users ADD COLUMN city TEXT;");
  } catch (e) {}

  try { db.exec("ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0;"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN rank TEXT DEFAULT 'Beginner Explorer';"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN referralCode TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN referredBy TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN completedQuests INTEGER DEFAULT 0;"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN achievements TEXT DEFAULT '[]';"); } catch (e) {}

  try { db.exec("ALTER TABLE quests ADD COLUMN isVerified BOOLEAN DEFAULT 0;"); } catch (e) {}
  try { db.exec("ALTER TABLE quests ADD COLUMN isQuestOfTheMonth BOOLEAN DEFAULT 0;"); } catch (e) {}
  try { db.exec("ALTER TABLE quests ADD COLUMN lat REAL;"); } catch (e) {}
  try { db.exec("ALTER TABLE quests ADD COLUMN lng REAL;"); } catch (e) {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referrerId TEXT,
      invitedUserId TEXT,
      bookingId INTEGER,
      reward INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  app.use(cors());
  app.use(express.json());

  // === MIDDLEWARE ===
  const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split(" ")[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // === API ROUTES ===

  // GET /api/quests
  app.get("/api/quests", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM quests ORDER BY createdAt DESC");
      let quests = stmt.all();
      // Parse JSON fields
      quests = quests.map(q => ({
        ...q,
        images: q.images ? JSON.parse(q.images) : [],
        tags: q.tags ? JSON.parse(q.tags) : [],
        withActors: Boolean(q.withActors),
        wifi: Boolean(q.wifi),
        parking: Boolean(q.parking),
        birthdayArea: Boolean(q.birthdayArea),
        isActive: Boolean(q.isActive),
        isPopular: Boolean(q.isPopular),
        isNew: Boolean(q.isNew),
        pricePerTeam: Boolean(q.pricePerTeam),
        isVerified: Boolean(q.isVerified),
        isQuestOfTheMonth: Boolean(q.isQuestOfTheMonth)
      }));
      res.json(quests);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch quests" });
    }
  });

  // POST /api/quests
  app.post("/api/quests", authMiddleware, (req, res) => {
    try {
      const data = req.body;
      const userId = req.user?.id;
      const role = req.user?.role;
      
      const insert = db.prepare(`
        INSERT INTO quests (
          slug, title, city, district, address, company, shortDescription, fullDescription,
          category, tags, difficulty, fearLevel, duration, playersMin, playersMax, ageLimit, priceAmount, priceFrom,
          priceType, pricePerTeam, currency, imageUrl, images, withActors, wifi, parking,
          birthdayArea, isActive, isPopular, isNew, rating, reviewsCount, ownerId, ownerName, ownerEmail, createdByRole
        ) VALUES (
          @slug, @title, @city, @district, @address, @company, @shortDescription, @fullDescription,
          @category, @tags, @difficulty, @fearLevel, @duration, @playersMin, @playersMax, @ageLimit, @priceAmount, @priceFrom,
          @priceType, @pricePerTeam, @currency, @imageUrl, @images, @withActors, @wifi, @parking,
          @birthdayArea, @isActive, @isPopular, @isNew, @rating, @reviewsCount, @ownerId, @ownerName, @ownerEmail, @createdByRole
        )
      `);
      
      const result = insert.run({
        slug: data.slug || null,
        title: data.title || null,
        city: data.city || null,
        district: data.district || null,
        address: data.address || null,
        company: data.company || null,
        shortDescription: data.shortDescription || null,
        fullDescription: data.fullDescription || null,
        category: data.category || null,
        difficulty: data.difficulty || null,
        fearLevel: data.fearLevel || null,
        duration: data.duration || null,
        playersMin: data.playersMin || null,
        playersMax: data.playersMax || null,
        ageLimit: data.ageLimit || null,
        priceAmount: data.priceAmount || null,
        priceFrom: data.priceFrom || null,
        priceType: data.priceType || null,
        currency: data.currency || null,
        imageUrl: data.imageUrl || null,
        images: JSON.stringify(data.images || []),
        tags: JSON.stringify(data.tags || []),
        withActors: data.withActors ? 1 : 0,
        wifi: data.wifi ? 1 : 0,
        parking: data.parking ? 1 : 0,
        birthdayArea: data.birthdayArea ? 1 : 0,
        isActive: data.isActive ? 1 : 0,
        isPopular: data.isPopular ? 1 : 0,
        isNew: data.isNew ? 1 : 0,
        pricePerTeam: data.pricePerTeam ? 1 : 0,
        rating: data.rating || 5.0,
        reviewsCount: data.reviewsCount || 0,
        ownerId: req.user?.id || data.ownerId || null,
        ownerName: req.user?.name || data.ownerName || null,
        ownerEmail: req.user?.email || data.ownerEmail || null,
        createdByRole: req.user?.role || data.createdByRole || 'admin'
      });

      res.status(201).json({ id: result.lastInsertRowid, ...data });
    } catch (err: any) {
      console.error("POST /api/quests error:", err.message);
      res.status(500).json({ error: "Failed to create quest: " + err.message });
    }
  });

  // PUT /api/quests/:id
  app.put("/api/quests/:id", authMiddleware, (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      // We will perform a generic update for simplicity, assuming data contains all fields
      const update = db.prepare(`
        UPDATE quests SET
          slug = @slug, title = @title, city = @city, district = @district, address = @address, 
          company = @company, shortDescription = @shortDescription, fullDescription = @fullDescription,
          category = @category, tags = @tags, difficulty = @difficulty, fearLevel = @fearLevel, duration = @duration, playersMin = @playersMin, 
          playersMax = @playersMax, ageLimit = @ageLimit, priceAmount = @priceAmount, priceFrom = @priceFrom,
          priceType = @priceType, pricePerTeam = @pricePerTeam, currency = @currency, imageUrl = @imageUrl, 
          images = @images, withActors = @withActors, wifi = @wifi, parking = @parking,
          birthdayArea = @birthdayArea, isActive = @isActive, isPopular = @isPopular, isNew = @isNew, 
          rating = @rating, reviewsCount = @reviewsCount, updatedAt = CURRENT_TIMESTAMP,
          isVerified = @isVerified, isQuestOfTheMonth = @isQuestOfTheMonth,
          lat = @lat, lng = @lng
        WHERE id = @id
      `);

      update.run({
        id: Number(id),
        slug: data.slug || null,
        title: data.title || null,
        city: data.city || null,
        district: data.district || null,
        address: data.address || null,
        company: data.company || null,
        shortDescription: data.shortDescription || null,
        fullDescription: data.fullDescription || null,
        category: data.category || null,
        difficulty: data.difficulty || null,
        fearLevel: data.fearLevel || null,
        duration: data.duration || null,
        playersMin: data.playersMin || null,
        playersMax: data.playersMax || null,
        ageLimit: data.ageLimit || null,
        priceAmount: data.priceAmount || null,
        priceFrom: data.priceFrom || null,
        priceType: data.priceType || null,
        currency: data.currency || null,
        imageUrl: data.imageUrl || null,
        images: JSON.stringify(data.images || []),
        tags: JSON.stringify(data.tags || []),
        withActors: data.withActors ? 1 : 0,
        wifi: data.wifi ? 1 : 0,
        parking: data.parking ? 1 : 0,
        birthdayArea: data.birthdayArea ? 1 : 0,
        isActive: data.isActive ? 1 : 0,
        isPopular: data.isPopular ? 1 : 0,
        isNew: data.isNew ? 1 : 0,
        pricePerTeam: data.pricePerTeam ? 1 : 0,
        rating: data.rating || 5.0,
        reviewsCount: data.reviewsCount || 0,
        isVerified: data.isVerified ? 1 : 0,
        isQuestOfTheMonth: data.isQuestOfTheMonth ? 1 : 0,
        lat: data.lat || null,
        lng: data.lng || null
      });

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update quest" });
    }
  });

  // DELETE /api/quests/:id
  app.delete("/api/quests/:id", authMiddleware, (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM quests WHERE id = ?").run(Number(id));
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete quest" });
    }
  });


  // === BOOKINGS API ===
  app.get("/api/bookings", authMiddleware, (req, res) => {
    try {
      const user = req.user;
      let stmt;
      if (user.role === 'admin') {
        stmt = db.prepare("SELECT * FROM bookings ORDER BY createdAt DESC");
        res.json(stmt.all());
      } else if (user.role === 'manager') {
        stmt = db.prepare("SELECT * FROM bookings WHERE questOwnerId = ? ORDER BY createdAt DESC");
        res.json(stmt.all(user.id));
      } else {
        stmt = db.prepare("SELECT * FROM bookings WHERE userId = ? ORDER BY createdAt DESC");
        res.json(stmt.all(user.id));
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", (req, res) => {
    try {
      const data = req.body;
      const insert = db.prepare(`
        INSERT INTO bookings (
          questId, questName, date, time, name, phone, email, participants, totalPrice, status, questOwnerId, questOwnerName, userId
        ) VALUES (
          @questId, @questName, @date, @time, @name, @phone, @email, @participants, @totalPrice, @status, @questOwnerId, @questOwnerName, @userId
        )
      `);
      // Optional: determine quest owner by querying quests table
      const quest = db.prepare("SELECT ownerId, ownerName FROM quests WHERE id = ?").get(data.questId) || {};
      
      const authHeader = req.headers.authorization;
      let userIdStr = null;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const user = jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
          userIdStr = user.id;
        } catch(e) {}
      }

      const result = insert.run({
        questId: data.questId || null,
        questName: data.questName || null,
        date: data.date || null,
        time: data.time || null,
        name: data.name || null,
        phone: data.phone || null,
        email: data.email || null,
        participants: data.participants || null,
        totalPrice: data.totalPrice || null,
        status: data.status || 'pending',
        questOwnerId: quest.ownerId || null,
        questOwnerName: quest.ownerName || null,
        userId: userIdStr || data.userId || null
      });
      res.status(201).json({ id: result.lastInsertRowid, ...data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  app.put("/api/bookings/:id", authMiddleware, (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(status, Number(id));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  app.delete("/api/bookings/:id", authMiddleware, (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM bookings WHERE id = ?").run(Number(id));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete booking" });
    }
  });

  // === FAVORITES API ===
  app.get("/api/favorites", authMiddleware, (req, res) => {
    try {
      const stmt = db.prepare("SELECT q.* FROM favorites f JOIN quests q ON f.questId = q.id WHERE f.userId = ?");
      let quests = stmt.all(req.user.id);
      quests = quests.map(q => ({
        ...q,
        images: q.images ? JSON.parse(q.images) : [],
        tags: q.tags ? JSON.parse(q.tags) : []
      }));
      res.json(quests);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", authMiddleware, (req, res) => {
    try {
      const { questId } = req.body;
      db.prepare("INSERT OR IGNORE INTO favorites (userId, questId) VALUES (?, ?)").run(req.user.id, questId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:questId", authMiddleware, (req, res) => {
    try {
      const { questId } = req.params;
      db.prepare("DELETE FROM favorites WHERE userId = ? AND questId = ?").run(req.user.id, questId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  // === AUTH API ===
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, referredBy } = req.body;
      const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (existingUser) return res.status(400).json({ error: "Email already in use" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const id = Date.now().toString(); // simple ID generator
      const role = email.toLowerCase() === "admin@admin.com" || email.toLowerCase() === "alexmargania31@gmail.com" ? "admin" : "user"; // basic admin setup
      const referralCode = "QG" + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const insert = db.prepare(`
        INSERT INTO users (id, email, name, password, role, referralCode, referredBy)
        VALUES (@id, @email, @name, @password, @role, @referralCode, @referredBy)
      `);
      insert.run({ id, email, name, password: hashedPassword, role, referralCode, referredBy: referredBy || null });
      
      if (referredBy) {
        // give XP to referrer
        try {
          db.prepare("UPDATE users SET xp = xp + 100 WHERE referralCode = ?").run(referredBy);
          const referrer = db.prepare("SELECT id FROM users WHERE referralCode = ?").get(referredBy) as any;
          if (referrer) {
            db.prepare("INSERT INTO referrals (referrerId, invitedUserId, reward) VALUES (?, ?, ?)").run(referrer.id, id, 100);
          }
        } catch(e) { console.error("Referral reward error:", e); }
      }

      const token = jwt.sign({ id, email, name, role }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ token, user: { id, email, name, role } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
      if (!user) return res.status(400).json({ error: "Invalid email or password" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to log in" });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
      
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      const user = db.prepare("SELECT id, email, name, role, createdAt, xp, level, rank, referralCode, referredBy, completedQuests, achievements, phone, company, city FROM users WHERE id = ?").get(decoded.id) as any;
      if (!user) return res.status(404).json({ error: "User not found" });
      
      user.achievements = user.achievements ? JSON.parse(user.achievements) : [];
      
      res.json({ user });
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // === REFERRALS API ===
  app.get("/api/referrals", authMiddleware, (req, res) => {
    try {
      const stmt = db.prepare(`
        SELECT u.name as invitedName, u.createdAt, r.reward 
        FROM referrals r 
        JOIN users u ON r.invitedUserId = u.id 
        WHERE r.referrerId = ?
        ORDER BY r.createdAt DESC
      `);
      res.json(stmt.all(req.user.id));
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch referrals" });
    }
  });

  // === LEADERBOARD API ===
  app.get("/api/leaderboard", (req, res) => {
    try {
      const topExplorers = db.prepare("SELECT id, name, xp, level, rank, completedQuests FROM users WHERE role='user' ORDER BY xp DESC LIMIT 10").all();
      res.json({ topExplorers });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // === ADMIN USERS API ===
  app.get("/api/admin/users", authMiddleware, (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
      const stmt = db.prepare("SELECT id, name, email, role, phone, company, city, createdAt FROM users ORDER BY createdAt DESC");
      res.json(stmt.all());
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/managers", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
      const { name, email, password, company, phone, city } = req.body;
      const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (existingUser) return res.status(400).json({ error: "Email already in use" });
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = Date.now().toString();
      
      const insert = db.prepare(`
        INSERT INTO users (id, email, name, password, role, company, phone, city)
        VALUES (@id, @email, @name, @password, 'manager', @company, @phone, @city)
      `);
      insert.run({ id, email, name, password: hashedPassword, company, phone, city });
      res.json({ id, email, name, role: 'manager', company, phone, city });
    } catch (err) {
      res.status(500).json({ error: "Failed to create manager" });
    }
  });
  
  app.put("/api/users/:id", authMiddleware, (req, res) => {
    try {
      const { id } = req.params;
      if (req.user.role !== 'admin' && req.user.id !== id) return res.status(403).json({ error: "Forbidden" });
      
      const { name, phone } = req.body;
      db.prepare("UPDATE users SET name = ?, phone = ? WHERE id = ?").run(name, phone, id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", authMiddleware, (req, res) => {
    try {
      const { id } = req.params;
      if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
      db.prepare("DELETE FROM users WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // === VITE MIDDLEWARE ===
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
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
