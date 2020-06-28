const sortByDisplayOrder = require('./src/utils/sort-by-display-order.js');
const CleanCSS = require ('clean-css');
const moment = require('moment');
moment.locale('en');

module.exports = function(eleventyConfig) {
  // Filter to minify CSS
  eleventyConfig.addFilter('cssmin', function(code) { 
    return new CleanCSS({}).minify(code).styles;
  });

  // Filter to handle dates
  eleventyConfig.addFilter('simple', function(date) {
    return moment(date).format('MM/DD/YYYY');
  });

  // Returns blog posts, sorted chronologically
  eleventyConfig.addCollection('blog', collection => {
    return collection.getFilteredByGlob('./src/blog/*.md');
  });

  // Returns journal posts, sorted chronologically
  eleventyConfig.addCollection('journal', collection => {
    return collection.getFilteredByGlob('./src/journal/*.md');
  });

  // Returns work items, sorted by display order
  eleventyConfig.addCollection('work', collection => {
    return sortByDisplayOrder(collection.getFilteredByGlob('./src/work/*.md'));
  });

  // Returns work items, sorted by display order then filtered by featured
  eleventyConfig.addCollection('featuredWork', collection => {
    return sortByDisplayOrder(collection.getFilteredByGlob('./src/work/*.md')).filter(
      x => x.data.featured
    );
  });

  // Base config
  return {
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: "src",
      output: "dist",
      includes: "_templates",
      templateFormats: ["html", "njk"]
    }
  };
};