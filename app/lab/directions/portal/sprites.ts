/**
 * Pixel art for the Portal direction. Each sprite is a list of rows, one
 * character per pixel: `.` is transparent, `C` is the current text color, and
 * any other letter is a fixed color from `PIXEL_COLORS`.
 */

export type Art = string[];

export const PIXEL_COLORS: Record<string, string> = {
  K: "#1a1c28",
  W: "#ffffff",
  w: "#c9cee6",
  B: "#efe6c9",
  b: "#c7b98f",
  S: "#26318a",
  s: "#4a60d0",
  g: "#9bf5ae",
  G: "#6fbf3b",
  O: "#f5a01a",
  o: "#b45f00",
  R: "#e4000f",
  Y: "#ffd23a",
  n: "#8a4b1c",
  m: "#b9bfcf",
  P: "#f5a9d8",
  L: "#c9b8f4",
  U: "#a9c9f6"
};

/** Lays `top` over `base` with its top-left pixel at (`x`, `y`) */
export function overlay(base: Art, top: Art, x: number, y: number): Art {
  const rows = base.map((row) => row.split(""));
  top.forEach((row, dy) => {
    [...row].forEach((pixel, dx) => {
      if (pixel === ".") return;
      const target = rows[y + dy];
      while (target.length <= x + dx) target.push(".");
      target[x + dx] = pixel;
    });
  });
  return rows.map((row) => row.join(""));
}

//
// Mascot
// ------

/** A beige CRT monitor with a phosphor face, one hand raised to wave */
const MASCOT_BODY: Art = [
  "......................KKK.",
  ".....................KWWWK",
  ".....................KWWWK",
  ".....................KWWwK",
  "......................KwK.",
  ".......................K..",
  "....KKKKKKKKKKKKKKKK...K..",
  "...KBBBBBBBBBBBBBBBBK..K..",
  "...KBKKKKKKKKKKKKKKBK..K..",
  "...KBKssSSSSSSSSSSKBK..K..",
  "...KBKsSSSSSSSSSSSKBK..K..",
  "...KBKSSSgSSSSgSSSKBK..K..",
  "...KBKSSSgSSSSgSSSKBKKKK..",
  ".KKKBKSSSSSSSSSSSSKBK.....",
  ".K.KBKSSgSSSSSSgSSKBK.....",
  ".K.KBKSSSggggggSSSKBK.....",
  ".K.KBKKKKKKKKKKKKKKBK.....",
  "KWWKBBBBBBBBBBBBBGBBK.....",
  "KWWKbbbbbbbbbbbbbbbbK.....",
  ".KK.KKKKKKKKKKKKKKKK......",
  ".........KbbbbK...........",
  ".......KKKKKKKKKK.........",
  ".........K....K...........",
  ".........K....K...........",
  "......KKKK....KKKK........",
  ".....KOOOOK..KOOOOK.......",
  ".....KooooK..KooooK.......",
  "......KKKK....KKKK........"
];

/** Things the mascot can hold up, 7×7 */
export const ITEMS = {
  star: [
    "...K...",
    "..KYK..",
    "KKKYKKK",
    "KYYYYYK",
    ".KYYYK.",
    ".KYKYK.",
    ".KK.KK."
  ],
  paper: [
    "KKKKKK.",
    "KWWWWKK",
    "KWKKWWK",
    "KWWWWWK",
    "KWKKKWK",
    "KWWWWWK",
    "KKKKKKK"
  ],
  pencil: [
    "....KKK",
    "...KYRK",
    "..KYYK.",
    ".KYYK..",
    "KbYK...",
    "KbK....",
    "KK....."
  ],
  wrench: [
    ".KK.KK.",
    ".KmKmK.",
    ".KmmmK.",
    "..KmK..",
    "..KmK..",
    "..KmK..",
    "..KKK.."
  ],
  case: [
    "..KKK..",
    ".K...K.",
    "KKKKKKK",
    "KnnnnnK",
    "KnnYnnK",
    "KnnnnnK",
    "KKKKKKK"
  ],
  mail: [
    ".......",
    "KKKKKKK",
    "KKWWWKK",
    "KWKWKWK",
    "KWWKWWK",
    "KWWWWWK",
    "KKKKKKK"
  ],
  heart: [
    ".KK.KK.",
    "KRRKRRK",
    "KRRRRRK",
    "KRRRRRK",
    ".KRRRK.",
    "..KRK..",
    "...K..."
  ],
  question: [
    "KKKKKKK",
    "KOKKKOK",
    "KOOOKOK",
    "KOOKOOK",
    "KOOOOOK",
    "KOOKOOK",
    "KKKKKKK"
  ]
} satisfies Record<string, Art>;

export type Item = keyof typeof ITEMS;

const PADDED_MASCOT = [
  ...Array.from({ length: 6 }, () => "".padEnd(27, ".")),
  ...MASCOT_BODY.map((row) => row.padEnd(27, "."))
];

/** The mascot, holding `item` up in its raised hand */
export const mascot = (item?: Item) =>
  item ? overlay(PADDED_MASCOT, ITEMS[item], 20, 0) : PADDED_MASCOT;

//
// Interface icons (9×9, drawn in the current color)
// --------------------------------------------------

export const ICONS = {
  power: [
    "....C....",
    ".C..C..C.",
    "C...C...C",
    "C...C...C",
    "C.......C",
    "C.......C",
    ".C.....C.",
    "..CCCCC..",
    "........."
  ],
  mail: [
    ".........",
    "CCCCCCCCC",
    "CC.....CC",
    "C.C...C.C",
    "C..C.C..C",
    "C...C...C",
    "C.......C",
    "CCCCCCCCC",
    "........."
  ],
  rss: [
    "CC.......",
    "..CC.....",
    "....C....",
    "CC...C...",
    "..C...C..",
    "...C...C.",
    "CC..C..C.",
    "CC..C..C.",
    "........."
  ],
  question: [
    "..CCCCC..",
    ".CC...CC.",
    "......CC.",
    "....CCC..",
    "...CC....",
    "...CC....",
    ".........",
    "...CC....",
    "...CC...."
  ],
  star: [
    "....C....",
    "...CCC...",
    "CCCCCCCCC",
    ".CCCCCCC.",
    "..CCCCC..",
    "..CCCCC..",
    ".CCC.CCC.",
    ".CC...CC.",
    "........."
  ],
  heart: [
    ".CC...CC.",
    "CCCC.CCCC",
    "CCCCCCCCC",
    "CCCCCCCCC",
    ".CCCCCCC.",
    "..CCCCC..",
    "...CCC...",
    "....C....",
    "........."
  ],
  house: [
    "....C....",
    "...CCC...",
    "..CCCCC..",
    ".CCCCCCC.",
    "CCCCCCCCC",
    ".CCC.CCC.",
    ".CCC.CCC.",
    ".CCC.CCC.",
    "........."
  ],
  case: [
    "...CCC...",
    "..C...C..",
    "CCCCCCCCC",
    "C.......C",
    "C...C...C",
    "CCCCCCCCC",
    "C.......C",
    "CCCCCCCCC",
    "........."
  ],
  pencil: [
    ".......CC",
    "......C.C",
    ".....C.C.",
    "....C.C..",
    "...C.C...",
    "..C.C....",
    ".CCC.....",
    ".CC......",
    "C........"
  ],
  code: [
    ".........",
    ".....C...",
    "..C..CC..",
    ".C..C..C.",
    "C...C...C",
    ".C..C..C.",
    "..CC..C..",
    "...C.....",
    "........."
  ],
  list: [
    ".........",
    "CC.CCCCCC",
    "CC.CCCCCC",
    ".........",
    "CC.CCCCCC",
    "CC.CCCCCC",
    ".........",
    "CC.CCCCCC",
    "CC.CCCCCC"
  ],
  print: [
    "..CCCCC..",
    "..C...C..",
    "CCCCCCCCC",
    "C.......C",
    "C.....C.C",
    "CCCCCCCCC",
    "..C...C..",
    "..CCCCC..",
    "........."
  ],
  arrowRight: [
    "....C....",
    "....CC...",
    "CCCCCCC..",
    "CCCCCCCC.",
    "CCCCCCC..",
    "....CC...",
    "....C....",
    ".........",
    "........."
  ],
  arrowDown: [
    "..CCC....",
    "..CCC....",
    "..CCC....",
    "CCCCCCC..",
    ".CCCCC...",
    "..CCC....",
    "...C.....",
    ".........",
    "........."
  ],
  arrowUp: [
    "...C.....",
    "..CCC....",
    ".CCCCC...",
    "CCCCCCC..",
    "..CCC....",
    "..CCC....",
    "..CCC....",
    ".........",
    "........."
  ]
} satisfies Record<string, Art>;

export type IconName = keyof typeof ICONS;

//
// Colored badges
// --------------

/** Green "go" button: an arrow in a circle */
export const GO = [
  "..KKKKK..",
  ".KGGGGGK.",
  "KGGGWGGGK",
  "KGGGGWGGK",
  "KGWWWWWGK",
  "KGGGGWGGK",
  "KGGGWGGGK",
  ".KGGGGGK.",
  "..KKKKK.."
];

export const INFO = [
  "KKKKKKKKK",
  "KGGGWGGGK",
  "KGGGGGGGK",
  "KGGWWGGGK",
  "KGGGWGGGK",
  "KGGGWGGGK",
  "KGGWWWGGK",
  "KGGGGGGGK",
  "KKKKKKKKK"
];

/** Smiley card, for "home page" links */
export const FACE = [
  "KKKKKKKKKKK",
  "KWWWWWWWWWK",
  "KWWKWWWKWWK",
  "KWWKWWWKWWK",
  "KWWWWWWWWWK",
  "KWKWWWWWKWK",
  "KWWKKKKKWWK",
  "KWWWWWWWWWK",
  "KKKKKKKKKKK"
];

/** A tiny version of the mascot's screen, as a "platform" icon */
export const MONITOR = [
  ".KKKKKKKKK.",
  "KBBBBBBBBBK",
  "KBKKKKKKKBK",
  "KBKSgSgSKBK",
  "KBKSSSSSKBK",
  "KBKSgggSKBK",
  "KBKKKKKKKBK",
  "KBBBBBBGBBK",
  ".KKKKKKKKK.",
  "...KKKKK..."
];

export const DIE = [
  ".KKKKKKK.",
  "KRRRRRRRK",
  "KRWRRRWRK",
  "KRRRRRRRK",
  "KRRRWRRRK",
  "KRRRRRRRK",
  "KRWRRRWRK",
  "KRRRRRRRK",
  ".KKKKKKK."
];

//
// Lettering
// ---------

const DIGITS: Record<string, Art> = {
  "0": [".CCC.", "C...C", "C..CC", "C.C.C", "CC..C", "C...C", ".CCC."],
  "4": ["...C.", "..CC.", ".C.C.", "C..C.", "CCCCC", "...C.", "...C."]
};

/** Digits set in a 5×7 pixel face, one column apart */
export const pixelNumber = (value: string): Art =>
  DIGITS["0"].map((_, row) =>
    [...value].map((digit) => DIGITS[digit][row]).join(".")
  );

/** Seeded field of pastel squares, brighter toward the middle */
export function mosaic(width: number, height: number, seed = 1): Art {
  const colors = ["P", "L", "U", "W"];
  let state = seed * 7919 + 17;
  const random = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };

  return Array.from({ length: height }, (_, y) => {
    const fade = Math.abs(y / (height - 1) - 0.45) * 2;
    return Array.from({ length: width }, () =>
      random() > fade + 0.15 ? "W" : colors[Math.floor(random() * 3)]
    ).join("");
  });
}
