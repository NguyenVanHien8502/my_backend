const Product = require("../models/productModel");
const User = require("../models/userModel");
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
    //Filtering
    const queryObj = { ...req.query };
    //xóa những trường k cần thiết ra khỏi queryObj
    const excludeFields = ["page", "sort", "limit", "field"];
    excludeFields.forEach((el) => delete queryObj[el]);
    //chuyển queryObj sang dạng JSON để chuyển bị cho việc tìm kiếm
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    //Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" "); //tách cái query đó ra và gộp thành 1 mảng
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //Limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v"); // loại bỏ trường được thêm tự động bởi mongo ra khỏi query
    }

    const product = await query;
    res.json(product);
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

const addToWishlist = asyncHandler(async (req, res) => {
  try {
    const { prodId } = req.body;
    const { _id } = req?.user;
    const user = await User.findById(_id);
    const alreadyadded = await user?.wishlist?.find(
      (productId) => productId.toString() === prodId.toString()
    );
    if (alreadyadded) {
      const user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    } else {
      const user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});

const rating = asyncHandler(async (req, res) => {
  const { prodId, star, comment } = req.body;
  const { _id } = req.user;
  const product_before = await Product.findById(prodId);
  const alreadyRated = await product_before.ratings.find(
    (userId) => userId.postedby.toString() === _id.toString()
  );
  if (alreadyRated) {
    //dùng cách trên thì nó sẽ bị thay đổi cái ObjectId của cái postedby, nhưng mà chắc cũng chả sao
    // const product = await Product.findByIdAndUpdate(
    //   prodId,
    //   {
    //     ratings: {
    //       star: star,
    //       postedby: _id,
    //     },
    //   },
    //   {
    //     new: true,
    //   }
    // );
    await Product.updateOne(
      {
        ratings: { $elemMatch: alreadyRated },
      },
      {
        $set: { "ratings.$.star": star, "ratings.$.comment": comment },
      },
      {
        new: true,
      }
    );
  } else {
    await Product.findByIdAndUpdate(
      prodId,
      {
        $push: {
          ratings: {
            star: star,
            comment: comment,
            postedby: _id,
          },
        },
      },
      {
        new: true,
      }
    );
  }
  //Calculate average star for each product
  const product_after = await Product.findById(prodId);
  const totalstar = await product_after.ratings.length;
  const sumstar = await product_after.ratings
    .map((item) => item.star)
    .reduce((prev, curr) => prev + curr, 0);
  const averagestar = (sumstar / totalstar).toFixed(1);
  const finalProduct = await Product.findByIdAndUpdate(
    prodId,
    {
      totalRating: averagestar,
    },
    {
      new: true,
    }
  );
  res.json(finalProduct);
});

module.exports = {
  createProduct,
  getaProduct,
  getallProduct,
  updatedProduct,
  deleteProduct,
  addToWishlist,
  rating,
};
