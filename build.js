const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');
const frontMatter = require('front-matter');

// Ensure build directory exists
fs.ensureDirSync('dist');

// Copy static assets
fs.copySync('static', 'dist/static');

// Read template
const template = fs.readFileSync('templates/main.html', 'utf-8');

// Process markdown files
function processMarkdown(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { attributes, body } = frontMatter(content);
    const html = marked.parse(body);
    
    return template
        .replace('{{title}}', attributes.title || 'My Site')
        .replace('{{content}}', html);
}

// Build pages
const pagesDir = 'content/pages';
fs.readdirSync(pagesDir).forEach(file => {
    if (file.endsWith('.md')) {
        const html = processMarkdown(path.join(pagesDir, file));
        const outFile = path.join('dist', file.replace('.md', '.html'));
        fs.writeFileSync(outFile, html);
    }
});

// Build blog posts
const postsDir = 'content/blog';
fs.ensureDirSync('dist/blog');
fs.readdirSync(postsDir).forEach(file => {
    if (file.endsWith('.md')) {
        const html = processMarkdown(path.join(postsDir, file));
        const outFile = path.join('dist/blog', file.replace('.md', '.html'));
        fs.writeFileSync(outFile, html);
    }
}); 