const CleanCSS = require('clean-css');
const terser = require('terser');
const fs = require("fs");
const sortByDisplayOrder = require('./src/utils/sort-by-display-order.js');
const moment = require('moment');
moment.locale('en');

module.exports = function(eleventyConfig) {
  // Filter to minify CSS
  eleventyConfig.addFilter('cssmin', function(code) { 
    return new CleanCSS({}).minify(code).styles;
  });

  // Filter to minify JS
  eleventyConfig.addFilter('jsmin', function(code) { 
    let minified = terser.minify(code);
    
    if (minified.error) { 
      console.log('Terser error: ', minified.error);
      return code;
    }

    return minified.code;
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

  // Set up 404 handling locally 
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, bs) {
        bs.addMiddleware("*", (req, res) => {
          const content_404 = fs.readFileSync('dist/404.html');
          // Provides the 404 content without redirect.
          res.write(content_404);
          // Add 404 http status code in request header.
          // res.writeHead(404, { "Content-Type": "text/html" });
          res.writeHead(404);
          res.end();
        });
      }
    }
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