const rssPlugin = require('@11ty/eleventy-plugin-rss');
const fs = require("fs");
const moment = require('moment');
const md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true
});
moment.locale('en');

module.exports = function(config) {
  // Passthrough File Copy
  config.addPassthroughCopy({'./admin' : 'admin'});
  config.addPassthroughCopy({'./src/_assets/svg' : 'svg'});
  config.addPassthroughCopy({'./src/_assets/images' : 'images'});
  config.addPassthroughCopy({'./src/_assets/fonts/**/*' : 'fonts/'});

  // Plugins
  config.addPlugin(rssPlugin);

  // Filter to handle dates
  config.addFilter("date", function (date, format) {
    return moment(date).format(format);
  });

  // Markdown filter
  config.addFilter('markdown', function(code) {
    return md.render(code);
  });

  // Returns News entries, sorted reverse-chronologically
  config.addCollection('news', collection => {
    return [...collection.getFilteredByGlob('./src/news/*.md')].reverse();
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
