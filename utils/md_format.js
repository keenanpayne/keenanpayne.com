/**
 * Format markdown provided by Roam42
 * Useful: https://regex101.com/r/CzLVqG/2
 * NOTE: In order to make this work, I can't nest blocks references of block references
 *       since those are exported as the block ID, not the block content.
 * TODO:
 * - Get this working well for a single file, then expand coverage
 * - Notify me how of many backlinks are present so I interlink or remove them
 * - Figure out how to format headings
 *   - Automatically format media headings with content type (e.g., "Book/Podcast/Video")
 */

fs = require('fs');

// Get file contents
fs.readFile('../posts/june-2022-learning.md', 'utf8', function(err, data) {  
  // Remove tags from media links
  const regexTags = /media(.*)/g;
  const tagSubstitution = ``;
  const result = data.replace(regexTags, tagSubstitution);
  // TODO: Do something with `people/` backlinks
  // TODO: Check all article text for full-text matches to any of my tags.
  //       If found, format the text with a link to the tag's page.
  // TODO: Check for all references to blog posts (e.g., [freelancing]([[Blog Post: Rebooting Freelancing]])
  //       and replace with correct permalinks for the blog post
  // TODO: Check for all lines containing `note/highlight` and replace
  //       then wrap text in a blockquote shortcode
  // TODO: Check for all lines containing `note/Question` or `Rhetorical Question`,
  //       remove this text, then replace with question shortcode

  // TODO: Hide this behind a flag
  // Write updates to file
  // fs.writeFile('../posts/june-2022-learning.md', result, 'utf8', function(err) {
    // console.log(err)
  // });
});