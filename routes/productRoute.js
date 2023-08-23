const express = require("express");
const {
  createProduct,
  getaProduct,
  getallProduct,
  updatedProduct,
  deleteProduct,
} = require("../controller/productCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProduct);
router.get("/", getallProduct);
router.get("/:id", getaProduct);
router.put("/:id", authMiddleware, isAdmin, updatedProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

module.exports = router;
