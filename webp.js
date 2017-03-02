/**
 * Convert PNG and JPEG images to WebP for browsers that support it
 */

var imagemin = require("imagemin"),
    webp = require("imagemin-webp"),
    outputFolder = "images",
    outputReading = "images/reading",
    PNGImages = "images/*.png",
    JPEGImages = "images/*.jpg",
    ReadingImages = "images/reading/*.jpg";

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

imagemin([ReadingImages], outputReading, {
  plugins: [webp({
    quality: 65
  })]
});
