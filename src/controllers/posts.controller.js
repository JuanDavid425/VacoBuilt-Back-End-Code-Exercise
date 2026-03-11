const db = require("../db/database");

function normalizePostInput(body) {
  return {
    title: body.title,
    contents: body.contents ?? body.text,
    categoryId: body.categoryId
  };
}

function formatPost(row) {
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    contents: row.contents,
    text: row.contents, // included for compatibility with provided Postman examples
    timeStamp: row.timeStamp,
    categoryId: row.categoryId
  };
}

function getAllPosts(req, res) {
  const { categoryId } = req.query;

  let query = `
    SELECT id, title, contents, timeStamp, categoryId
    FROM posts
  `;
  const params = [];

  if (categoryId) {
    query += ` WHERE categoryId = ?`;
    params.push(categoryId);
  }

  query += ` ORDER BY datetime(timeStamp) DESC, id DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch posts" });
    }

    const posts = rows.map(formatPost);
    return res.status(200).json(posts);
  });
}

function getPostById(req, res) {
  const { id } = req.params;

  db.get(
    `
    SELECT id, title, contents, timeStamp, categoryId
    FROM posts
    WHERE id = ?
    `,
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Failed to fetch post" });
      }

      if (!row) {
        return res.status(404).json({ error: "Post not found" });
      }

      return res.status(200).json(formatPost(row));
    }
  );
}

function createPost(req, res) {
  const { title, contents, categoryId } = normalizePostInput(req.body);

  if (!title || !contents || !categoryId) {
    return res.status(400).json({
      error: "title, contents (or text), and categoryId are required"
    });
  }

  db.get(`SELECT id FROM categories WHERE id = ?`, [categoryId], (catErr, category) => {
    if (catErr) {
      return res.status(500).json({ error: "Failed to validate category" });
    }

    if (!category) {
      return res.status(400).json({ error: "Invalid categoryId" });
    }

    const timeStamp = new Date().toISOString();

    db.run(
      `
      INSERT INTO posts (title, contents, timeStamp, categoryId)
      VALUES (?, ?, ?, ?)
      `,
      [title, contents, timeStamp, categoryId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: "Failed to create post" });
        }

        db.get(
          `
          SELECT id, title, contents, timeStamp, categoryId
          FROM posts
          WHERE id = ?
          `,
          [this.lastID],
          (fetchErr, row) => {
            if (fetchErr) {
              return res.status(500).json({ error: "Post created but failed to fetch it" });
            }

            return res.status(200).json(formatPost(row));
          }
        );
      }
    );
  });
}

function updatePost(req, res) {
  const { id } = req.params;
  const { title, contents, categoryId } = normalizePostInput(req.body);

  if (!title || !contents || !categoryId) {
    return res.status(400).json({
      error: "title, contents (or text), and categoryId are required"
    });
  }

  db.get(`SELECT * FROM posts WHERE id = ?`, [id], (findErr, existingPost) => {
    if (findErr) {
      return res.status(500).json({ error: "Failed to find post" });
    }

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    db.get(`SELECT id FROM categories WHERE id = ?`, [categoryId], (catErr, category) => {
      if (catErr) {
        return res.status(500).json({ error: "Failed to validate category" });
      }

      if (!category) {
        return res.status(400).json({ error: "Invalid categoryId" });
      }

      db.run(
        `
        UPDATE posts
        SET title = ?, contents = ?, categoryId = ?
        WHERE id = ?
        `,
        [title, contents, categoryId, id],
        function (updateErr) {
          if (updateErr) {
            return res.status(500).json({ error: "Failed to update post" });
          }

          db.get(
            `
            SELECT id, title, contents, timeStamp, categoryId
            FROM posts
            WHERE id = ?
            `,
            [id],
            (fetchErr, row) => {
              if (fetchErr) {
                return res.status(500).json({ error: "Post updated but failed to fetch it" });
              }

              return res.status(200).json(formatPost(row));
            }
          );
        }
      );
    });
  });
}

function deleteAllPosts(req, res) {
  db.run(`DELETE FROM posts`, [], (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete all posts" });
    }

    return res.status(200).send();
  });
}

function deletePostById(req, res) {
  const { id } = req.params;

  db.run(`DELETE FROM posts WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Failed to delete post" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).send();
  });
}

function generateSampleData(req, res) {
  const samplePosts = [
    {
      title: "Welcome to the blog",
      contents: "<p>This is a general post.</p>",
      categoryId: 1
    },
    {
      title: "Node.js for APIs",
      contents: "<p>Express is a fast way to build APIs.</p>",
      categoryId: 2
    },
    {
      title: "Something random",
      contents: "<p>This is a random blog post.</p>",
      categoryId: 3
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO posts (title, contents, timeStamp, categoryId)
    VALUES (?, ?, ?, ?)
  `);

  for (const post of samplePosts) {
    stmt.run(post.title, post.contents, new Date().toISOString(), post.categoryId);
  }

  stmt.finalize((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to generate sample data" });
    }

    return res.status(200).json({ message: "Sample data generated" });
  });
}

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deleteAllPosts,
  deletePostById,
  generateSampleData
};