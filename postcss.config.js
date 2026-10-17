export default {
  plugins: {
    // Sass-style mixins: `@define-mixin` / `@mixin`
    "postcss-mixins": {},
    // Nested rules, compiled the same way Sass did
    "postcss-nested": {},
    // `@custom-media --min-960 (width >= 960px);`
    "postcss-custom-media": {},
    // `(width >= 960px)` -> `(min-width: 960px)`
    "postcss-media-minmax": {},
    autoprefixer: {}
  }
};
