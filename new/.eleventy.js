const moment = require('moment');
moment.locale('en');

module.exports = function(eleventyConfig) {
  // Date filter
  eleventyConfig.addFilter("simple", function(date) {
    return moment(date).format("MM/DD/YYYY");
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