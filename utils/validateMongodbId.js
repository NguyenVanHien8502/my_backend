const mongoose = require("mongoose");

//kiểm tra xem id truyền từ param có đúng định dạng không
const validateMongoDbId = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) throw new Error("This ID is not valid or not Found");
};

module.exports = validateMongoDbId;
