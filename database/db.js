const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'wealth_training.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

module.exports = db;