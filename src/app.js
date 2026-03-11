const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const postsRoutes = require("./routes/posts.routes");
const categoriesRoutes = require("./routes/categories.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/posts", postsRoutes);
app.use("/categories", categoriesRoutes);

app.get("/", (req, res) => {
  res.json({ message: "VacoBuilt Blog API is running" });
});

module.exports = app;