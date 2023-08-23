const express = require("express");
const {
  createUser,
  loginUser,
  getAllUser,
  getaUser,
  deleteaUser,
  updateaUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
  logout,
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.post("/loginUser", loginUser);
router.get("/", authMiddleware, isAdmin, getAllUser);
router.get("/logout", logout);
router.get("/refreshToken", handleRefreshToken);
//đặt cái route /refreshToken lên trước route /:id vì nếu đặt sau thì sẽ bị hiểu nhầm "refreshToken" chính là id của route /:id
router.get("/:id", authMiddleware, isAdmin, getaUser);
router.delete("/", authMiddleware, deleteaUser);
router.put("/", authMiddleware, updateaUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unBlockUser);

module.exports = router;
