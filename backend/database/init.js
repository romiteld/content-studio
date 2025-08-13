const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'wealth_training.db');
const db = new sqlite3.Database(dbPath);

const initDatabase = () => {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  
  db.exec(schema, (err) => {
    if (err) {
      console.error('Error initializing database:', err);
    } else {
      console.log('Database initialized successfully');
      console.log('Templates: LOCKED');
      console.log('Brand protection: ACTIVE');
    }
    db.close();
  });
};

initDatabase();