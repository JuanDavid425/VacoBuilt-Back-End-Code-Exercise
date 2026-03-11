const express = require("express");
const router = express.Router();

const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deleteAllPosts,
  deletePostById,
  generateSampleData
} = require("../controllers/posts.controller");

router.get("/generateSampleData", generateSampleData);
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/", deleteAllPosts);
router.delete("/:id", deletePostById);

module.exports = router;