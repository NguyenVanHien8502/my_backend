const generateToken = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

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
    throw new Error(error)
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
    throw new Error(error)
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
};
