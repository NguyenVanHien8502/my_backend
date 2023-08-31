const multer = require("multer");
const asyncHandler = require("express-async-handler");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const randomName = crypto.randomBytes(10).toString("hex");
    const extName = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + randomName + extName);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      {
        msg: "Unsupport file format",
      },
      false
    );
  }
};

const uploadPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadImages = asyncHandler(async (req, res) => {
  console.log(req.file);
  const url = `${req.protocol}://${req.get("host")}/api/assets/${
    req.file.filename
  }`;
  res.json({ url: url });
});

const getFile = asyncHandler(async (req, res) => {
  const { fileName } = req.params;
  const uploadDirectory = path.join(__dirname, "../public/images");
  const filepath = path.join(uploadDirectory, fileName);
  fs.access(filepath, fs.constants.F_OK, (err) => {
    if (!err) {
      res.sendFile(filepath);
    } else {
      res.json({
        msg: "There is error when get file because file is not exist",
      });
    }
  });
});

module.exports = { uploadPhoto, uploadImages, getFile };
