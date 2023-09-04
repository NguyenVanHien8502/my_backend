const generateToken = require("../config/jwtToken");
const generateRefreshToken = require("../config/refreshToken");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("./emailCtrl");
const crypto = require("crypto");

const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("User Already Exists!");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email: email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser?._id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });

    res.json({
      msg: "Login Successfully!",
      success: true,
      user: {
        _id: findUser?._id,
        username: findUser?.username,
        email: findUser?.email,
        role: findUser?.role,
        token: generateToken(findUser?._id),
      },
    });
  } else {
    throw new Error("Invalid Credential!");
  }
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findAdmin = await User.findOne({ email: email });
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    if (findAdmin.role === "admin") {
      const refreshToken = await generateRefreshToken(findAdmin?._id);
      const updateAdmin = await User.findByIdAndUpdate(
        findAdmin?._id,
        {
          refreshToken: refreshToken,
        },
        {
          new: true,
        }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });
      res.json({
        msg: "Login Successfully!",
        success: true,
        admin: {
          _id: updateAdmin?._id,
          username: updateAdmin?.username,
          email: updateAdmin?.email,
          role: updateAdmin?.role,
          token: generateToken(updateAdmin?._id),
        },
      });
    } else {
      throw new Error("You are not an admin");
    }
  } else {
    throw new Error("Invalid Credential!");
  }
});

//handle refreshToken
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken: refreshToken });
  if (!user)
    throw new Error("No Refresh Token present in database or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user?.id !== decoded.id)
      throw new Error("There is something wrong with refresh token");
    const newToken = generateToken(user?._id);
    res.json({ newToken });
  });
});

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken: refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204);
  }
  await User.findOneAndUpdate(
    { refreshToken: refreshToken },
    {
      refreshToken: "",
    },
    {
      new: true,
    }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  return res.sendStatus(204);
});

const updateaUser = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        username: req?.body?.username,
        email: req?.body?.email,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllUser = asyncHandler(async (req, res) => {
  try {
    const allUser = await User.find();
    res.json(allUser);
  } catch (error) {
    throw new Error(error);
  }
});

const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const findUser = await User.findById({ _id: id });
  if (findUser) {
    res.json(findUser);
  } else {
    throw new Error("Not exist this user");
  }
});

const deleteaUser = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    console.log(req.user);
    validateMongoDbId(_id);
    const deleteUser = await User.findByIdAndDelete(_id);
    res.json({
      success: true,
      deleteUser: deleteUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const blockuser = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json({
      msg: "User Blocked",
      BlockUser: blockuser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const unBlockUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const unBlockuser = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      msg: "User unBlocked",
      unBlockUser: unBlockuser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    if (await user.isPasswordMatched(password)) {
      throw new Error("Password before and after change must be different");
    } else {
      user.password = password;
      const updatePassword = await user.save();
      res.json({
        msg: "Password is changed successfully",
        success: true,
        user: updatePassword,
      });
    }
  } else {
    res.json({
      msg: "Password is not changed",
    });
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User is not found with this email");
  try {
    const resetToken = await user.createPasswordResetToken();
    // user.passwordResetToken = resetToken;
    // await user.save();
    const resetURL = `Hi, Please follow this link to reset your password. This link is valid in 10 minutes from now. <a href="http://localhost:5000/api/user/reset-password/${resetToken}">Click here</a>`;
    const data = {
      to: email,
      subject: "Forgot Password Link",
      text: "Hey User",
      htm: resetURL,
    };
    sendEmail(data);
    res.json(resetToken);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  // cách tự nghĩ kết hợp với 2 dòng ở hàm forgot password
  // const { resetToken } = req.params;
  // const { password, repassword } = req.body;
  // const user = await User.findOne({ passwordResetToken: resetToken });
  // if (user) {
  //   if (password === repassword) {
  //     user.password = password;
  //     await user.save();
  //     res.json({
  //       msg: "Reset password successfully",
  //       success: true,
  //     });
  //   } else {
  //     res.json("Password and Repassword must be the same");
  //   }
  // } else {
  //   throw new Error("Not user is reseted password");
  // }

  // cách trên ytb
  const { resetToken } = req.params;
  const { password } = req.body;
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error("Token Expired, Please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({
    msg: "Reset Password Successfully",
    success: true,
  });
});

const getWishlist = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const findUser = await User.findById(_id).populate("wishlist");
    res.json({
      wishlist: findUser?.wishlist,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const getPrice = await Product.findById(productId).select("price").exec();
    const newCart = await new Cart({
      userId: _id,
      productId: productId,
      quantity: quantity,
      price: getPrice.price,
    }).save();
    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.find({ userId: _id }).populate("productId");
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProductFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.body;
  const { _id } = req.user;
  validateMongoDbId(itemId);
  validateMongoDbId(_id);
  try {
    const deleteProductFromCart = await Cart.deleteOne({
      userId: _id,
      _id: itemId,
    });
    res.json(deleteProductFromCart);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProductQuantityFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { itemId, newQuantity } = req.body;
  validateMongoDbId(_id);
  validateMongoDbId(itemId);
  try {
    const updateItem = await Cart.findByIdAndUpdate(
      {
        userId: _id,
        _id: itemId,
      },
      {
        quantity: newQuantity,
      },
      {
        new: true,
      }
    );
    res.json({
      msg: "Updated Product Quantity successfully",
      success: true,
      updateItem: updateItem,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  //Xóa toàn bộ giỏ hàng
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const emptyCart = await Cart.deleteMany({ userId: _id });
    res.json({
      msg: "Deleted all item in cart successfully",
      success: true,
      infomation: emptyCart,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const createOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const { shippingInfo } = req.body;
    const cart = await Cart.find({ userId: _id });
    let totalPrice = 0;
    for (let i = 0; i < cart.length; i++) {
      totalPrice += cart[i].price * cart[i].quantity;
    }
    let orderItems = [];
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i].productId;
      object.quantity = cart[i].quantity;
      object.price = cart[i].price;
      orderItems.push(object);
    }
    const order = await Order.create({
      user: _id,
      shippingInfo: shippingInfo,
      orderItems: orderItems,
      totalPrice: totalPrice,
    });
    //cập nhật lại số lượng sản phẩm sau khi order
    for (let i = 0; i < orderItems.length; i++) {
      await Product.findByIdAndUpdate(
        orderItems[i].product,
        {
          $inc: {
            quantity: -orderItems[i].quantity,
            sold: +orderItems[i].quantity,
          },
        },
        {
          new: true,
        }
      );
    }
    //xóa cart sau khi order
    await Cart.deleteMany({ userId: _id });
    res.json({
      msg: "Ordered successfully!",
      success: true,
      order: order,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getUserOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const getUserOrder = await Order.find({ user: _id }).populate(
      "orderItems.product"
    );
    res.json(getUserOrder);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const getAllOrder = await Order.find().populate("orderItems.product");
    res.json(getAllOrder);
  } catch (error) {
    throw new Error(error);
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const { applyCoupon } = req.body;
    const cart = await Cart.find({ userId: _id });
    let totalPriceAfterDiscount = 0;
    for (let i = 0; i < cart.length; i++) {
      let appliedCoupon = false;
      for (let j = 0; j < applyCoupon.length; j++) {
        let coupon = await Coupon.findOne({ name: applyCoupon[i].coupon });
        if (!coupon) throw new Error("Not exist this coupon");
        if (
          JSON.parse(JSON.stringify(cart[i].productId)) ===
          applyCoupon[j].validProduct
        ) {
          appliedCoupon = true;
          totalPrice =
            cart[i].price * cart[i].quantity -
            (coupon.discount * cart[i].price * cart[i].quantity) / 100;
          totalPriceAfterDiscount += totalPrice;
          break;
        }
      }
      if (!appliedCoupon) {
        totalPriceAfterDiscount += cart[i].price * cart[i].quantity;
      }
    }
    res.json(totalPriceAfterDiscount);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
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
  createOrder,
  getUserOrder,
  getAllOrders,
  applyCoupon,
};
