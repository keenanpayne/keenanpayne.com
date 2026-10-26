export default {
  plugins: {
    // Nested rules, compiled the same way Sass did
    "postcss-nested": {},
    // `(width >= 960px)` -> `(min-width: 960px)`
    "postcss-media-minmax": {},
    autoprefixer: {}
  }
};
