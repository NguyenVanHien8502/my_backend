const express = require("express");
const {
  createBlog,
  getaBlog,
  getallBlog,
  updatedBlog,
  deleteBlog,
  likeBlog,
  dislikeBlog,
} = require("../controller/blogCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createBlog);
router.get("/:id", getaBlog);
router.get("/", getallBlog);
router.put("/likes", authMiddleware, likeBlog);
router.put("/dislikes", authMiddleware, dislikeBlog);
router.put("/:id", authMiddleware, isAdmin, updatedBlog);
router.delete("/:id", authMiddleware, isAdmin, deleteBlog);

module.exports = router;
