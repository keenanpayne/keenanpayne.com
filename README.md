# Keenan Payne's Website

[![Netlify Status](https://api.netlify.com/api/v1/badges/23342844-d353-4977-9ac2-e69e9e17fd82/deploy-status)](https://app.netlify.com/sites/keenanpayne/deploys)

Feel free to fork this and use my code and designs for whatever you'd like. You can add credit to myself if you please, but it's not necessary.

## Available Scripts

### Development

```bash
# Start development server with hot reloading
npm run dev

# Just serve the site without watching for changes
npm run serve

# Build and serve the production site
npm run serve:prod

# Start development server (alternative to dev)
npm run start
```

### Building

```bash
# Build for production
npm run build

# Build assets for development
npm run assets:build:dev

# Build assets for production
npm run assets:build:prod
```

### Code Quality

```bash
# Run all code quality checks
npm run validate

# Fix all auto-fixable issues
npm run fix

# Linting
npm run lint          # Run all linters
npm run lint:js      # Run JavaScript linting
npm run lint:css     # Run SCSS linting
npm run lint:fix     # Fix all auto-fixable lint issues

# Formatting
npm run format        # Format all files
npm run check:format  # Check formatting without making changes
```

### Maintenance

```bash
# Clean build artifacts
npm run clean         # Remove _site directory
npm run clean:deps    # Remove dependencies
npm run clean:all     # Remove both build artifacts and dependencies

# Security and Updates
npm run audit         # Check for vulnerabilities and outdated deps
npm run audit:fix     # Try to fix vulnerabilities and update deps

# Build Analysis
npm run size          # Show size of build directory
npm run size:detail   # Generate detailed size report
```

### Debugging

```bash
# Run Eleventy with debug output
npm run debug
```

## Project Structure

```
.
├── _site/           # Built site (gitignored)
├── _data/           # Global data files for Eleventy
├── _includes/       # Reusable template components
├── bookshelf/       # Bookshelf content
├── drafts/         # Draft content (not published)
├── feed/           # RSS feed configuration
├── fonts/          # Custom font files
├── images/         # Static image assets
├── js/             # JavaScript source files
├── portfolio/      # Portfolio project content
├── posts/          # Blog post content
├── sass/           # SCSS source files
├── services/       # Service-related content
├── type/           # TypeScript type definitions
├── .eleventy.js    # Eleventy configuration
├── .eleventyignore # Files to ignore during build
├── .eslintrc.json  # ESLint configuration
├── .prettierrc     # Prettier configuration
├── .stylelintrc.json # Stylelint configuration
├── .node-version   # Node.js version specification
├── netlify.toml    # Netlify deployment configuration
├── package.json    # Project dependencies and scripts
└── postcss.config.js # PostCSS configuration
```

## Development Workflow

1. **Starting Development**:

   ```bash
   npm install        # Install dependencies
   npm run dev       # Start development server
   ```

2. **Code Quality**:

   - Run `npm run validate` before committing to check all code quality rules
   - Use `npm run fix` to automatically fix common issues
   - Format your code with `npm run format`

3. **Building for Production**:

   ```bash
   npm run build    # Creates optimized production build
   npm run serve:prod # Serves production build locally
   ```

4. **Maintenance**:
   - Regularly run `npm run audit` to check for security issues
   - Use `npm run size` to monitor build size
   - Clean up with `npm run clean:all` when needed

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Credits

- [Netlify](https://netlify.com)
  - Superb web hosting and deployment platform
- [Eleventy](https://11ty.dev/)
  - Flexible JavaScript static site generator
- [Sass](https://sass-lang.com/)
  - CSS preprocessor for better styling
- [PostCSS](https://postcss.org/)
  - CSS transformation tool with autoprefixer and custom media queries
- [Markdown-it](https://github.com/markdown-it/markdown-it)
  - Markdown parser with support for footnotes and anchors
- [Luxon](https://moment.github.io/luxon/)
  - Modern JavaScript date/time library
- [ESLint](https://eslint.org/)
  - JavaScript linting utility
- [Prettier](https://prettier.io/)
  - Code formatter for consistent style
- [Stylelint](https://stylelint.io/)
  - CSS/SCSS linting utility
- [Eleventy Plugins](https://www.11ty.dev/docs/plugins/)
  - Navigation, RSS, syntax highlighting, and external links
- [Node.js](https://nodejs.org/)
  - JavaScript runtime environment
- [Git](https://git-scm.com/)
  - Version control system

## License

This project is licensed under the MIT License - see the LICENSE file for details.
