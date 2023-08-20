const { default: mongoose } = require("mongoose");

const dbConnect = () => {
  try {
    const conn = mongoose.connect(process.env.MONGO_URL);
    console.log("Database Connected Successfully!");
  } catch (error) {
    console.log("Database Connected Error!");
  }
};

module.exports = dbConnect;
