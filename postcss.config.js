module.exports = {
  plugins: [
    require('./utilities/space-unit'),
    require('postcss-custom-media'),
    require('postcss-media-minmax'),
    require('autoprefixer')
  ]
}
