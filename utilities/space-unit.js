const defaults = {
    rootSelector: ':root',
    declaration: '--spacing-unit',
    unit: 'spaces',
    spacing: '0.5rem'
};

const getSpacing = (root, opts) => {
  // Start with the default spacing
  let spacing = opts.spacing;

  // Walk over all the root selectors
  root.walkRules(opts.rootSelector, rule => {

      // Omit the process if the selector is inside a print media query
      if (rule.parent && rule.parent.params === 'print') return

      // Find all the spacing unit definitions
      rule.walkDecls(opts.declaration, decl => {
        spacing = decl.value;
      });
  });

  return spacing;
};

// Remove the unit of a spacing declaration value
const stripUnit = val => {
  const capture = val.match(/\d*\.?\d+/);

  return capture.length > 0 && capture[0]
};

module.exports = (options = defaults) => {
  return {
    postcssPlugin: 'space-unit',
    Once (root, { result }) {
      // Find the initial spacing unit assigment
      const spacingUnit = getSpacing(root, options);

      // Regular expression to use to find all the spacing definitions
      const spacingRegEx = new RegExp('\\d*\\.?\\d+' + options.unit, 'gi');

      // Replace the spacing definitions with something
      // the browser can understand
      root.replaceValues(spacingRegEx, {
        fast: options.unit
      }, val => `calc(${stripUnit(val)} * ${spacingUnit})`);
    }
  }
}

module.exports.postcss = true
