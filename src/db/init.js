const db = require("./database");

function initializeDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        contents TEXT NOT NULL,
        timeStamp TEXT NOT NULL,
        categoryId INTEGER NOT NULL,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
      )
    `);

    const categories = [
      [1, "General"],
      [2, "Technology"],
      [3, "Random"]
    ];

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO categories (id, name)
      VALUES (?, ?)
    `);

    for (const category of categories) {
      stmt.run(category);
    }

    stmt.finalize();
  });
}

module.exports = initializeDatabase;