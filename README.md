# Eleventy Boilerplate

## Table of Contents
- [Eleventy Boilerplate](#eleventy-boilerplate)
  - [Table of Contents](#table-of-contents)
  - [Tooling](#tooling)
  - [Development](#development)
    - [Build tools](#build-tools)
    - [Folder Structure](#folder-structure)
  - [To Do](#to-do)

## Tooling

This is built using the [Eleventy static site generator](https://www.11ty.io/). Eleventy was chosen due to its agnostic tooling decisions.

## Development

### Build tools

**Install dependencies**

```
npm i
```

**Start development**
Start Eleventy server, compile Sass, transpile JavaScript, optimize images, and watch for changes inside of `/src`.

```
npm start
```

### Folder Structure

```
/project-directory
├── src/
│   ├── _data/
│   ├── _templates/
|   ├── assets/
│   |   ├── images/
│   |   ├── js/
│   └── ├── sass/
├── dist/
```

The `/src` folder contains all of the content for our Eleventy website. Inside of `/src/_data`, and `/src/_templates` we have our [global data files](https://www.11ty.io/docs/data-global/) and [templates](https://www.11ty.io/docs/templates/), respectively. All other files and folders inside of `/src` are [markdown](https://www.markdownguide.org/) content files.

**Note:** I have [configured Eleventy](https://www.11ty.io/docs/config/) to work with this set of folders so that content and templates are better organized and our root directory clean.

Our entire website gets compiled into static HTML inside of `/dist`. This folder is excluded from the git repository.

## To Do

Now that you have new website generated using the Eleventy Boilerplate, you should go through each of these steps to update the codebase with the correct settings and information.  

- [ ] Rename `<title>` in `admin/index.html` replacing "Eleventy Boilerplate" with project name
- [ ] Update `name` key in `package.json` with project name
- [ ] Update `description` key in `package.json` with project description
- [ ] Replace "Eleventy Boilerplate" heading in `README.md` with project name
- [ ] Update `name` key in `/src/_data/site.json` with project name
- [ ] Update all keys in `/src/_data/meta.json` with project details
- [ ] Add logo image or SVG to `logos.njk`