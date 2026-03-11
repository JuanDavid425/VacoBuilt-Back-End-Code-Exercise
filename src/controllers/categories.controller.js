const db = require("../db/database");

function getCategories(req, res) {
  db.all(`SELECT id, name FROM categories ORDER BY id ASC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch categories" });
    }

    return res.status(200).json(rows);
  });
}

module.exports = {
  getCategories
};