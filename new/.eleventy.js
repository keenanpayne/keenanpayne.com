const sortByDisplayOrder = require('./views/utils/sort-by-display-order.js');
const moment = require('moment');
moment.locale('en');

module.exports = function(eleventyConfig) {
  // Set directories to pass through to the `/dist` folder
  eleventyConfig.addPassthroughCopy('./dist/js');
  eleventyConfig.addPassthroughCopy('./dist/css');
  eleventyConfig.addPassthroughCopy('./dist/images');

  // Date filter
  eleventyConfig.addFilter("simple", function(date) {
    return moment(date).format("MM/DD/YYYY");
  });

  // Returns blog posts, sorted chronologically
  eleventyConfig.addCollection('blog', collection => {
    return collection.getFilteredByGlob('./views/blog/*.md');
  });

  // Returns journal posts, sorted chronologically
  eleventyConfig.addCollection('journal', collection => {
    return collection.getFilteredByGlob('./views/journal/*.md');
  });

  // Returns work items, sorted by display order
  eleventyConfig.addCollection('work', collection => {
    return sortByDisplayOrder(collection.getFilteredByGlob('./views/work/*.md'));
  });

  // Returns work items, sorted by display order then filtered by featured
  eleventyConfig.addCollection('featuredWork', collection => {
    return sortByDisplayOrder(collection.getFilteredByGlob('./views/work/*.md')).filter(
      x => x.data.featured
    );
  });

  // Base config
  return {
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: "views",
      output: "_site",
      includes: "_templates",
      templateFormats: ["html", "njk"]
    }
  };
};