// Ref: https://sia.codes/posts/eleventy-and-cloudinary-images/
// Set constants for the Cloudinary URL and fallback widths for images when not supplied
const CLOUDNAME = "keenan-payne";
const FOLDER = "";
const BASE_URL = `https://res.cloudinary.com/${CLOUDNAME}/image/upload/`;
const FALLBACK_WIDTHS = [300, 600, 680, 1360];
const FALLBACK_WIDTH = 1360;

// Generate the src attribute using the fallback width or a supplied width
export function cloudinarySrc(file: string, width?: number) {
  return `${BASE_URL}q_auto,f_auto,w_${width ? width : FALLBACK_WIDTH}/${FOLDER}${file}`;
}

// Generate srcset attribute using the fallback widths or a supplied array of widths
export function cloudinarySrcset(file: string, widths?: number[]) {
  const widthSet = widths ? widths : FALLBACK_WIDTHS;
  return widthSet
    .map((width) => `${cloudinarySrc(file, width)} ${width}w`)
    .join(", ");
}
