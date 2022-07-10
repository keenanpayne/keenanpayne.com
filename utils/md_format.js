/**
 * Format markdown provided by Roam42
 * Useful: https://regex101.com/r/CzLVqG/2
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

  // Write updates to file
  fs.writeFile('../posts/june-2022-learning.md', result, 'utf8', function(err) {
    console.log(err)
  });
});