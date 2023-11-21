const fs = require("fs");

const deleteImage = (path) => {
  fs.unlink(path, (err) => {
    console.log(err);
  });
};

module.exports = deleteImage;
