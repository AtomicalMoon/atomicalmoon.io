// Database abstraction layer (SQLite/PostgreSQL)
import Database from 'better-sqlite3';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = join(__dirname, '../data/portfolio.db');
  }

  init() {
    try {
      // Ensure data directory exists
      const { mkdirSync } = require('fs');
      const dataDir = join(__dirname, '../data');
      if (!existsSync(dataDir)) {
        mkdirSync(dataDir, { recursive: true });
      }

      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.createTables();
      console.log('✅ Database initialized');
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      throw error;
    }
  }

  createTables() {
    // Commissions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS commissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        budget REAL,
        deadline TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Gallery items table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS gallery_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        src TEXT NOT NULL,
        alt TEXT,
        title TEXT,
        description TEXT,
        tags TEXT,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Analytics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        event_data TEXT,
        user_agent TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // Commission methods
  createCommission(data) {
    const stmt = this.db.prepare(`
      INSERT INTO commissions (name, email, type, description, budget, deadline)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.name,
      data.email,
      data.type,
      data.description,
      data.budget || null,
      data.deadline || null
    );
  }

  getCommissions(status = null) {
    if (status) {
      return this.db.prepare('SELECT * FROM commissions WHERE status = ? ORDER BY created_at DESC').all(status);
    }
    return this.db.prepare('SELECT * FROM commissions ORDER BY created_at DESC').all();
  }

  // Gallery methods
  addGalleryItem(data) {
    const stmt = this.db.prepare(`
      INSERT INTO gallery_items (src, alt, title, description, tags, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.src,
      data.alt || '',
      data.title || '',
      data.description || '',
      data.tags ? JSON.stringify(data.tags) : null,
      data.order_index || 0
    );
  }

  getGalleryItems() {
    return this.db.prepare('SELECT * FROM gallery_items ORDER BY order_index ASC, created_at DESC').all();
  }

  // Analytics methods
  logEvent(eventType, eventData, userAgent, ipAddress) {
    const stmt = this.db.prepare(`
      INSERT INTO analytics (event_type, event_data, user_agent, ip_address)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(
      eventType,
      JSON.stringify(eventData),
      userAgent,
      ipAddress
    );
  }

  getAnalytics(startDate, endDate) {
    const stmt = this.db.prepare(`
      SELECT * FROM analytics 
      WHERE created_at BETWEEN ? AND ?
      ORDER BY created_at DESC
    `);
    return stmt.all(startDate || '1970-01-01', endDate || new Date().toISOString());
  }

  // Settings methods
  setSetting(key, value) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    return stmt.run(key, value);
  }

  getSetting(key) {
    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
    const result = stmt.get(key);
    return result ? result.value : null;
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

export default DatabaseManager;
