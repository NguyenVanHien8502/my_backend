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
  updatePassword,
  forgotPassword,
  resetPassword,
  loginAdmin,
  getWishlist,
  userCart,
  getUserCart,
  deleteProductFromCart,
  updateProductQuantityFromCart,
  emptyCart,
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.post("/loginUser", loginUser);
router.post("/loginAdmin", loginAdmin);
router.get("/", authMiddleware, isAdmin, getAllUser);
router.get("/logout", logout);
router.get("/refreshToken", handleRefreshToken);
router.get("/wishlist", authMiddleware, getWishlist);
router.get("/cart", authMiddleware, getUserCart);
//đặt cái route /refreshToken lên trước route /:id vì nếu đặt sau thì sẽ bị hiểu nhầm "refreshToken" chính là id của route /:id
router.get("/:id", authMiddleware, isAdmin, getaUser);
router.delete("/", authMiddleware, deleteaUser);
router.put("/", authMiddleware, updateaUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unBlockUser);
router.put("/changePassword", authMiddleware, updatePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);
router.post("/cart", authMiddleware, userCart);
router.delete(
  "/delete-product-from-cart",
  authMiddleware,
  deleteProductFromCart
);
router.put(
  "/update-product-quantity-from-cart",
  authMiddleware,
  updateProductQuantityFromCart
);
router.delete("/empty-cart", authMiddleware, emptyCart);
module.exports = router;
