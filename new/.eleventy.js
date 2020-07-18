const rssPlugin = require('@11ty/eleventy-plugin-rss');
const CleanCSS = require('clean-css');
const terser = require('terser');
const fs = require("fs");
const sortByDisplayOrder = require('./src/utils/sort-by-display-order.js');
const moment = require('moment');
moment.locale('en');

// Filters
const dateFilter = require('./src/filters/date-filter.js');
const w3DateFilter = require('./src/filters/w3-date-filter.js');

module.exports = function(config) {
  // Add filters
  config.addFilter('dateFilter', dateFilter);
  config.addFilter('w3DateFilter', w3DateFilter);

  // Plugins
  config.addPlugin(rssPlugin);

  // Filter to minify CSS
  config.addFilter('cssmin', function(code) { 
    return new CleanCSS({}).minify(code).styles;
  });

  // Filter to minify JS
  config.addFilter('jsmin', function(code) { 
    let minified = terser.minify(code);
    
    if (minified.error) { 
      console.log('Terser error: ', minified.error);
      return code;
    }

    return minified.code;
  });

  // Filter to handle dates
  config.addFilter('simple', function(date) {
    return moment(date).format('MM/DD/YYYY');
  });

  // Returns blog posts, sorted reverse-chronologically
  config.addCollection('blog', collection => {
    return [...collection.getFilteredByGlob('./src/blog/*.md')].reverse();
  });

  // Returns journal posts, sorted reverse-chronologically
  config.addCollection('journal', collection => {
    return [...collection.getFilteredByGlob('./src/journal/*.md')].reverse();
  });

  // Returns work items, sorted by display order
  config.addCollection('work', collection => {
    return sortByDisplayOrder(collection.getFilteredByGlob('./src/work/*.md'));
  });

  // Returns work items, sorted by display order then filtered by featured
  config.addCollection('featuredWork', collection => {
    return sortByDisplayOrder(collection.getFilteredByGlob('./src/work/*.md')).filter(
      x => x.data.featured
    );
  });

  // Returns books, sorted reverse-chronologically
  config.addCollection('books', collection => {
    return [...collection.getFilteredByGlob('./src/books/*.md')].reverse();
  });

  // Set up 404 handling locally 
  // Ref: https://www.11ty.dev/docs/quicktips/not-found/
  config.setBrowserSyncConfig({
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