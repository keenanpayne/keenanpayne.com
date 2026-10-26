import { useEffect, useRef } from "react";

import { cx, useMounted } from "../../site";

/*
 * LED billboard
 * ==================================================
 * A photo shown the way the city's giant screens show a face: a mosaic of
 * glowing square LEDs, bigger and brighter where the photo is light, with a
 * few dead pixels and a magenta cast rising from the bottom. The photo
 * itself is the `<img>` beneath, seen through an LED grid until the page's
 * script draws the mosaic over it; hovering the screen clears the mosaic to
 * show the photo. The LED colors come from the skin's tokens, so the
 * mosaic is redrawn when the color scheme changes.
 */

/** LEDs along each side of the screen */
const CELLS = 44;

/** Canvas pixels per side: crisp at the largest size the screen is shown */
const SIZE = 704;

/** Cloudinary and this site send images the canvas may read back */
const readable = (src: string) =>
  (src.startsWith("/") && !src.startsWith("//")) ||
  src.startsWith("https://res.cloudinary.com/");

/** A small, seeded random number generator, so dead pixels stay put */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const smooth = (low: number, high: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
};

const LEDS = [
  "--neon-led-low",
  "--neon-led-mid",
  "--neon-led-high",
  "--neon-led-hot"
];

function paint(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const sample = document.createElement("canvas");
  sample.width = sample.height = CELLS;
  const reader = sample.getContext("2d", { willReadFrequently: true });
  const out = canvas.getContext("2d");
  if (!reader || !out) return;

  // Cover the square, centered
  const side = Math.min(image.naturalWidth, image.naturalHeight);
  reader.drawImage(
    image,
    (image.naturalWidth - side) / 2,
    (image.naturalHeight - side) / 2,
    side,
    side,
    0,
    0,
    CELLS,
    CELLS
  );

  let pixels: Uint8ClampedArray;
  try {
    pixels = reader.getImageData(0, 0, CELLS, CELLS).data;
  } catch {
    return; // The image wasn't sent for reading back
  }

  const style = getComputedStyle(canvas);
  const colors = LEDS.map((name) => style.getPropertyValue(name).trim());
  const cast = style.getPropertyValue("--neon-led-cast").trim();
  const random = seeded(CELLS);
  const cell = SIZE / CELLS;

  out.clearRect(0, 0, SIZE, SIZE);
  for (let y = 0; y < CELLS; y++) {
    for (let x = 0; x < CELLS; x++) {
      const index = (y * CELLS + x) * 4;
      const light = smooth(
        0.06,
        0.92,
        (0.2126 * pixels[index] +
          0.7152 * pixels[index + 1] +
          0.0722 * pixels[index + 2]) /
          255
      );
      const dead = random() < 0.045;
      const tinted = random() < (y / CELLS - 0.62) * 1.6;
      if (dead) continue;

      const size = cell * (0.42 + light * 0.46);
      out.globalAlpha = 0.28 + light * 0.72;
      out.fillStyle = tinted
        ? cast
        : colors[
            Math.min(colors.length - 1, Math.floor(light * colors.length))
          ];
      out.fillRect(
        x * cell + (cell - size) / 2,
        y * cell + (cell - size) / 2,
        size,
        size
      );
    }
  }
  out.globalAlpha = 1;
}

export function Billboard({
  src,
  alt,
  className,
  children
}: {
  src: string;
  alt: string;
  className?: string;
  /** Captions or tags laid over the screen's frame */
  children?: React.ReactNode;
}) {
  const mounted = useMounted();
  const canvas = useRef<HTMLCanvasElement>(null);
  const mosaic = mounted && readable(src);

  useEffect(() => {
    const element = canvas.current;
    if (!mosaic || !element) return;

    const image = new Image();
    image.crossOrigin = "anonymous";
    let drawn = false;
    const draw = () => {
      if (!image.complete || !image.naturalWidth) return;
      paint(element, image);
      if (!drawn) {
        drawn = true;
        element.dataset.drawn = "";
      }
    };
    image.addEventListener("load", draw);
    image.src = src;

    const scheme = matchMedia("(prefers-color-scheme: dark)");
    const theme = new MutationObserver(draw);
    scheme.addEventListener("change", draw);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
    return () => {
      image.removeEventListener("load", draw);
      scheme.removeEventListener("change", draw);
      theme.disconnect();
    };
  }, [mosaic, src]);

  return (
    <div className={cx("neon-billboard", className)}>
      <div className="neon-billboard__screen">
        <img src={src} alt={alt} />
        {mosaic && (
          <canvas
            ref={canvas}
            className="neon-billboard__mosaic"
            width={SIZE}
            height={SIZE}
            aria-hidden="true"
          />
        )}
      </div>
      {children}
    </div>
  );
}
