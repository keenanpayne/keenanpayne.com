// Ref: https://sia.codes/posts/eleventy-and-cloudinary-images/
const CLOUDNAME = "keenan-payne";
const CLOUDINARY_URL = `https://res.cloudinary.com/${CLOUDNAME}`;

/** Delivery URL prefix for uploaded images or videos */
export const cloudinaryUpload = (kind: "image" | "video") =>
  `${CLOUDINARY_URL}/${kind}/upload/`;

const BASE_URL = cloudinaryUpload("image");
const FALLBACK_WIDTHS = [300, 600, 680, 1360];
const FALLBACK_WIDTH = 1360;

/** Image `src` for the `components/image.njk` shortcode */
export function cloudinarySrc(file: string, width = FALLBACK_WIDTH) {
  return `${BASE_URL}q_auto,f_auto,w_${width}/${file}`;
}

/** Image `srcset` for the `components/image.njk` shortcode */
export function cloudinarySrcset(file: string) {
  return FALLBACK_WIDTHS.map(
    (width) => `${cloudinarySrc(file, width)} ${width}w`
  ).join(", ");
}

/** An image with a transform of its own, e.g. `c_fill,g_face,ar_1:1,w_480` */
export const cloudinaryImage = (file: string, transform: string) =>
  `${BASE_URL}f_auto,q_auto,${transform}/${file}`;

/** Portfolio cover image (case study pages and entry lists) */
export const cloudinaryCover = (file: string) =>
  cloudinaryImage(file, "w_1000");
