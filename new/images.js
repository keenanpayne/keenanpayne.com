/**
 * Optimizes images and converts JPEG images 
 * to WebP for browsers that support it
 */

/**
 * NOTE: I'm unable to get this working for some Reason.
 *       Every time I run this script it doesn't seem to proces 
 *       any of the files that I have. 
 */
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");

(async () => {
  const files = await imagemin(["assets/images/**/.{jpg}"], {
    destination: "_site/dist/images/**/",
    plugins: [
      imageminJpegtran()
    ]
  });

  console.log(files);
})();