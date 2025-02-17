const fs = require('fs-extra');
const marked = require('marked');
const frontMatter = require('front-matter');

// Create necessary directories
const dirs = ['dist', 'src/content/blog', 'src/content/pages'];
dirs.forEach(dir => fs.ensureDirSync(dir));

// Copy static assets
fs.copySync('src/static', 'dist/static');

// Copy standalone index.html
fs.copySync('src/index.html', 'dist/index.html');

// Read base template
const baseTemplate = fs.readFileSync('src/templates/main.html', 'utf-8');

// Helper function to replace template variables
function applyTemplate(template, data) {
    return template
        .replace('{{title}}', data.title || 'My Site')
        .replace('{{content}}', data.content);
}

// Process markdown files
function processMarkdown(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { attributes, body } = frontMatter(content);
    return {
        ...attributes,
        content: marked.parse(body)
    };
}

// Process blog posts
const postsDir = 'src/content/blog';
const posts = fs.readdirSync(postsDir)
    .filter(file => file.endsWith('.md'))
    .map(file => {
        const data = processMarkdown(`${postsDir}/${file}`);
        const html = applyTemplate(baseTemplate, data);
        const outputPath = `dist/blog/${file.replace('.md', '.html')}`;
        fs.outputFileSync(outputPath, html);
        return { ...data, url: `/blog/${file.replace('.md', '.html')}` };
    });

// Process pages (excluding index.md since we have a standalone index.html)
const pagesDir = 'src/content/pages';
fs.readdirSync(pagesDir)
    .filter(file => file.endsWith('.md') && file !== 'index.md')
    .forEach(file => {
        const data = processMarkdown(`${pagesDir}/${file}`);
        const html = applyTemplate(baseTemplate, data);
        const outputPath = `dist/${file.replace('.md', '.html')}`;
        fs.outputFileSync(outputPath, html);
    }); 