// Ref: https://sia.codes/posts/eleventy-and-cloudinary-images/
// Set constants for the Cloudinary URL and fallback widths for images when not supplied by the shorcode params
const CLOUDNAME = "keenan-payne";
const FOLDER = "";
const BASE_URL = `https://res.cloudinary.com/${CLOUDNAME}/image/upload/`;
const FALLBACK_WIDTHS = [300, 600, 680, 1360];
const FALLBACK_WIDTH = 1360;

// Generate srcset attribute using the fallback widths or a supplied array of widths
function getSrcset(file, widths) {
  const widthSet = widths ? widths : FALLBACK_WIDTHS;
  return widthSet
    .map((width) => {
      return `${getSrc(file, width)} ${width}w`;
    })
    .join(", ");
}
// Generate the src attribute using the fallback width or a width supplied
// by the shortcode params
function getSrc(file, width) {
  return `${BASE_URL}q_auto,f_auto,w_${width ? width : FALLBACK_WIDTH}/${FOLDER}${file}`;
}

// Export the two shortcodes to be able to access them in our Eleventy config
module.exports = {
  srcset: (file, widths) => getSrcset(file, widths),
  src: (file, width) => getSrc(file, width)
};
