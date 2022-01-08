const { DateTime } = require("luxon");
const fs = require("fs");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function(eleventyConfig) {
  // Add plugins
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);

  // https://www.11ty.dev/docs/data-deep-merge/
  eleventyConfig.setDataDeepMerge(true);

  // Alias `layout: post` to `layout: layouts/post.njk`
  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  eleventyConfig.addFilter("plural", string => {
    return `${string}s`;
  });

  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("LLL dd, yyyy");
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if( n < 0 ) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Return the smallest number argument
  eleventyConfig.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  function filterTagList(tags) {
    return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
  }

  eleventyConfig.addFilter("filterTagList", filterTagList)

  // Create a collection of all tags
  eleventyConfig.addCollection("tagList", function(collection) {
    let tagSet = new Set();
    collection.getAll().forEach(item => {
      (item.data.tags || []).forEach(tag => tagSet.add(tag));
    });

    return filterTagList([...tagSet]);
  });

  // Create a collection of all content types
  eleventyConfig.addCollection('typeList', function(collection) {
    // Create a new Set object to store unique
    // collection of values for content types
    //   Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
    let typeSet = new Set();
    
    // Get all items items from Eleventy
    //   Ref: https://www.11ty.dev/docs/collections/#getall()
    collection.getAll().filter(function(item) {
      // Filter items based on the `Type` key existing 
      // Store value of `Type` key in `typeSet` if we haven't already
      return "type" in item.data ? typeSet.add(item.data.type) : false;
    });

    // Return all content types
    return typeSet;
  });

  // Explicitly create collections for each post type
  // Get all posts and sort reverse-chronologically 
  // then filter based on whether they have a `Type` key
  // that contains 'Reflections'
  eleventyConfig.addCollection('essay', function(collection) {
    return collection.getAllSorted().filter(function(item) {
      if ("type" in item.data) {
        return item.data.type == 'Essay' ? item : false;
      }
    });
  });

  eleventyConfig.addCollection('tutorial', function(collection) {
    return collection.getAllSorted().filter(function(item) {
      if ("type" in item.data) {
        return item.data.type == 'Tutorial' ? item : false;
      }
    });
  });

  eleventyConfig.addCollection('article', function(collection) {
    return collection.getAllSorted().filter(function(item) {
      if ("type" in item.data) {
        return item.data.type == 'Article' ? item : false;
      }
    });
  });

  eleventyConfig.addCollection('reflection', function(collection) {
    return collection.getAllSorted().filter(function(item) {
      if ("type" in item.data) {
        return item.data.type == 'Reflection' ? item : false;
      }
    });
  });

  eleventyConfig.addCollection('draft', function(collection) {
    return collection.getFilteredByGlob("drafts/*.md").filter(function(item) {
      return item;
    });
  });

  // Copy the `images` and `css` folders to the output
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("css");

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    breaks: false,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink()
  }).disable('code').use(require('markdown-it-footnote')); // Addressing https://www.11ty.dev/docs/languages/markdown/#there-are-extra-and-in-my-output

  eleventyConfig.setLibrary("md", markdownLibrary);

  // Retrieve first image for post in collection
  // Ref: https://github.com/11ty/eleventy/issues/230
  eleventyConfig.addShortcode('first_image', post => extractFirstImage(post));
  
  /**
   * @param {*} doc A large object full of all sorts of information about a document.
   * @returns {String} the markup of the first image.
   */
  function extractFirstImage(doc) {
    if (!doc.hasOwnProperty('templateContent')) {
      console.warn('❌ Failed to extract image: Document has no property `templateContent`.');
      return;
    }
  
    const content = doc.templateContent;
  
    if (content.includes('<img')) {
      const imgTagBegin = content.indexOf('<img');
      const imgTagEnd = content.indexOf('>', imgTagBegin);
  
      return content.substring(imgTagBegin, imgTagEnd + 1);
    }
  
    return '';
  }

  // Override Browsersync defaults (used only with --serve)
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = fs.readFileSync('_site/404.html');

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.writeHead(404, {"Content-Type": "text/html; charset=UTF-8"});
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false
  });


  // Playing with shortcodes
  eleventyConfig.addShortcode("p_large", function(p_large) {
    return `<p class="-large">${p_large.content}</p>`;
  });

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: [
      "md",
      "njk",
      "html",
      "liquid"
    ],

    // -----------------------------------------------------------------
    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Don’t worry about leading and trailing slashes, we normalize these.

    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`

    // Optional (default is shown)
    pathPrefix: "/",
    // -----------------------------------------------------------------

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "liquid",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "liquid",

    // Opt-out of pre-processing global data JSON files: (default: `liquid`)
    dataTemplateEngine: false,

    // These are all optional (defaults are shown):
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
