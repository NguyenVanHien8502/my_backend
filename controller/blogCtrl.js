const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.json({
      msg: "Blog is created successfully",
      success: true,
      newBlog: newBlog,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getaBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    await Blog.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 },
      },
      { new: true }
    );
    const findBlog = await Blog.findById(id)
      .populate("likes")
      .populate("dislikes");
    res.json(findBlog);
  } catch (error) {
    throw new Error(error);
  }
});

const getallBlog = asyncHandler(async (req, res) => {
  try {
    const findBlogs = await Blog.find();
    res.json({
      allBlogs: findBlogs,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updatedBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const updateBlog = await Blog.findByIdAndUpdate(
      id,
      {
        title: req?.body?.title,
        category: req?.body?.category,
        description: req?.body?.description,
        image: req?.body?.image,
      },
      {
        new: true,
      }
    );
    res.json({
      msg: "Blog is updated successfully",
      success: true,
      updatedBlog: updateBlog,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deleleBlog = await Blog.findByIdAndDelete(id);
    res.json({
      msg: "Blog is deleted successfully",
      success: true,
      deleleBlog: deleleBlog,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const likeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoDbId(blogId);

  //find the blog which you want to be liked
  const blog = await Blog.findById(blogId);

  //find the login user
  const loginUserId = req?.user?._id;

  //find if the user has liked the blog
  const isLiked = blog?.isLiked;

  //find if the user has disliked the blog
  const alreadyDisliked = blog?.dislikes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );

  if (alreadyDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
        $push: { likes: loginUserId },
        isLiked: true,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
        isDisliked: false,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
});

const dislikeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  const loginUserId = req?.user?._id;
  //find blog which user want to be dislike
  const blog = await Blog.findById(blogId);

  const isDisliked = blog.isDisliked;
  const alreadyLiked = await blog?.likes?.find(
    (userId) => userId.toString() === loginUserId.toString()
  );
  if (alreadyLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
        $push: { dislikes: loginUserId },
        isDisliked: true,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
  if (isDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { dislikes: loginUserId },
        isDisliked: true,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
});

module.exports = {
  createBlog,
  getaBlog,
  getallBlog,
  updatedBlog,
  deleteBlog,
  likeBlog,
  dislikeBlog,
};
