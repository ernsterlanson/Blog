# Static Site with HTML, CSS, JavaScript, and simple Node libraries

A simple static site generator that converts Markdown content to HTML pages. No complicated frameworks, just clean and efficient web development.

## Prerequisites

1. Install Node.js and npm from [https://nodejs.org/](https://nodejs.org/)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the site:
```bash
npm run build
```

3. Start the development server:
```bash
npm run serve
```

The site will be available at `http://localhost:3000`

## Project Structure

```
.
├── build.js              # Build script that converts Markdown to HTML
├── serve.js             # Development server
├── content/            # Your Markdown content
│   ├── pages/         # Static pages (About, FAQ, etc.)
│   └── blog/          # Blog posts
├── templates/         # HTML templates
├── static/           # Static assets
│   ├── css/         # Stylesheets
│   └── js/          # JavaScript files
└── dist/            # Generated site (created by build script)
```

## Adding Content

### Pages
Add Markdown files to `content/pages/`. Use front matter for metadata:

```markdown
---
title: Page Title
---

# Your content here
```

### Blog Posts
Add Markdown files to `content/blog/` with front matter:

```markdown
---
title: Post Title
date: YYYY-MM-DD
---

# Your post content
```

## Features

1. ✅ Simple landing page
2. ✅ Blog post template
3. ✅ Markdown to HTML converter
4. 🔄 Ghost newsletter integration (coming soon)
5. 🔄 Contact form (coming soon)

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- Marked (for Markdown parsing)
- Front Matter (for metadata)