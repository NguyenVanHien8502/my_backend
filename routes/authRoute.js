const express = require("express");
const {
  createUser,
  loginUser,
  getAllUser,
  getaUser,
  deleteaUser,
  updateaUser,
} = require("../controller/userCtrl");
const {authMiddleware, isAdmin} = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.post("/loginUser", loginUser);
router.get("/", authMiddleware, isAdmin, getAllUser);
router.get("/:id", authMiddleware, isAdmin, getaUser);
router.delete("/", authMiddleware, deleteaUser);
router.put("/",authMiddleware, updateaUser);

module.exports = router;