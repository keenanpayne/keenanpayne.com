/**
 * Convert PNG and JPEG images to WebP for browsers that support it
 */

var imagemin = require("imagemin"),
    webp = require("imagemin-webp"),
    outputFolder = "images",
    PNGImages = "images/*.png",
    JPEGImages = "images/*.jpg";

imagemin([PNGImages], outputFolder, {
  plugins: [webp({
      lossless: true
  })]
});

imagemin([JPEGImages], outputFolder, {
  plugins: [webp({
    quality: 65
  })]
});
