const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

const uploadPhoto = multer({
    storage: multerStorage,
    
})