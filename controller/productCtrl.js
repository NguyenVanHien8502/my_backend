const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const slugify = require("slugify");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req?.body?.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getaProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const findProduct = await Product.findById(id);
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getallProduct = asyncHandler(async (req, res) => {
  try {
    const findallProduct = await Product.find(req.query);
    res.json(findallProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const updatedProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    if (req?.body?.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        title: req?.body?.title,
        description: req?.body?.description,
        price: req?.body?.price,
        category: req?.body?.category,
        brand: req?.body?.brand,
        quantity: req?.body?.quantity,
        images: req?.body?.images,
        color: req?.body?.color,
      },
      {
        new: true,
      }
    );
    res.json(updatedProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deleteProduct = await Product.findByIdAndDelete(id);
    res.json({ deletedProduct: deleteProduct });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getaProduct,
  getallProduct,
  updatedProduct,
  deleteProduct,
};
