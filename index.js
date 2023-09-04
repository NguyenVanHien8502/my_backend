const express = require("express");
const dbConnect = require("./config/dbConnect");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 6000;
const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const couponRouter = require("./routes/couponRoute");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const { authMiddleware, isAdmin } = require("./middlewares/authMiddleware");
const {
  uploadPhoto,
  uploadImages,
  getFile,
} = require("./middlewares/handleUploadFile");

dbConnect();

//giúp hiển thị các request trong terminal
app.use(morgan("dev"));

//chuyển hóa dữ liệu đầu vào sang dạng json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//giúp đọc thông tin trong cookie
app.use(cookieParser());

app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/coupon", couponRouter);

app.get("/api/assets/:fileName", getFile);
app.post(
  "/api/uploads",
  authMiddleware,
  isAdmin,
  uploadPhoto.single("file"),
  uploadImages
);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
