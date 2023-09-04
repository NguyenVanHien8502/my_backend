const Coupon = require("../models/couponModel");
const validateMongoDbId = require("../utils/validateMongodbId");
const asyncHandler = require("express-async-handler");

const createCoupon = asyncHandler(async (req, res) => {
  try {
    const newCoupon = await Coupon.create(req.body);
    res.json(newCoupon);
  } catch (error) {
    throw new Error(error);
  }
});

const getCoupon = asyncHandler(async (req, res) => {
  try {
    const getCoupons = await Coupon.find();
    res.json(getCoupons);
  } catch (error) {
    throw new Error(error);
  }
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      {
        name: req?.body?.name,
        expiry: req?.body?.expiry,
        discount: req?.body?.discount,
      },
      {
        new: true,
      }
    );
    res.json({
      msg: "Coupon is updated successfully",
      success: true,
      updatedCoupon: updatedCoupon,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(id);
    res.json({
      msg: "Coupon is deleted successfully",
      success: true,
      deletedCoupon: deletedCoupon,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = { createCoupon, getCoupon, updateCoupon, deleteCoupon };
