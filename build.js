const fs = require('fs-extra');
const marked = require('marked');
const frontMatter = require('front-matter');
const handlebars = require('handlebars');
const path = require('path');

// Configure marked to allow HTML
marked.setOptions({
    headerIds: false,
    mangle: false,
    html: true  // This allows HTML in markdown
});

// Create necessary directories
const dirs = ['dist', 'dist/blog', 'src/content/blog', 'src/content/pages', 'src/templates/partials'];
dirs.forEach(dir => fs.ensureDirSync(dir));

// Copy static assets
fs.copySync('src/static', 'dist/static');

// Register partials
const partialsDir = 'src/templates/partials';
fs.readdirSync(partialsDir).forEach(file => {
    const partialName = path.basename(file, '.html');
    const partialContent = fs.readFileSync(path.join(partialsDir, file), 'utf-8');
    handlebars.registerPartial(partialName, partialContent);
});

// Read templates
const baseTemplate = fs.readFileSync('src/templates/main.html', 'utf-8');
const blogTemplate = fs.readFileSync('src/templates/blog.html', 'utf-8');
const blogIndexTemplate = fs.readFileSync('src/templates/blog-index.html', 'utf-8');
const indexTemplate = fs.readFileSync('src/index.html', 'utf-8');
const contactTemplate = fs.readFileSync('src/templates/contact.html', 'utf-8');
const aboutTemplate = fs.readFileSync('src/templates/about.html', 'utf-8');

// Register handlebars helpers
handlebars.registerHelper('formatDate', function(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Compile templates
const compiledBaseTemplate = handlebars.compile(baseTemplate);
const compiledBlogTemplate = handlebars.compile(blogTemplate);
const compiledBlogIndexTemplate = handlebars.compile(blogIndexTemplate);
const compiledIndexTemplate = handlebars.compile(indexTemplate);
const compiledContactTemplate = handlebars.compile(contactTemplate);
const compiledAboutTemplate = handlebars.compile(aboutTemplate);

// Helper function to replace template variables
function applyTemplate(template, data) {
    return template(data);
}

// Process markdown files
function processMarkdown(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { attributes, body } = frontMatter(content);
    const html = marked.parse(body);
    
    // Generate excerpt if not provided
    if (!attributes.excerpt) {
        const plainText = html.replace(/<[^>]+>/g, '');
        attributes.excerpt = plainText.slice(0, 160) + '...';
    }
    
    return {
        ...attributes,
        content: html
    };
}

// Process blog posts
const postsDir = 'src/content/blog';
const posts = fs.readdirSync(postsDir)
    .filter(file => file.endsWith('.md'))
    .map(file => {
        const data = processMarkdown(`${postsDir}/${file}`);
        const html = applyTemplate(compiledBlogTemplate, {
            ...data,
            date: data.date ? new Date(data.date).toISOString().split('T')[0] : null
        });
        const outputPath = `dist/blog/${file.replace('.md', '.html')}`;
        fs.outputFileSync(outputPath, html);
        return {
            ...data,
            url: `/blog/${file.replace('.md', '.html')}`,
            date: data.date ? new Date(data.date).toISOString().split('T')[0] : null
        };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

// Generate blog index
const blogIndexHtml = applyTemplate(compiledBlogIndexTemplate, { posts });
fs.outputFileSync('dist/blog/index.html', blogIndexHtml);

// Generate main index with recent posts
const recentPosts = posts.slice(0, 3); // Get 3 most recent posts
const indexHtml = applyTemplate(compiledIndexTemplate, { recentPosts });
fs.outputFileSync('dist/index.html', indexHtml);

// Process pages
const pagesDir = 'src/content/pages';
fs.readdirSync(pagesDir)
    .filter(file => file.endsWith('.md') && file !== 'index.md')
    .forEach(file => {
        const data = processMarkdown(`${pagesDir}/${file}`);
        const template = data.template === 'contact.html' ? compiledContactTemplate : 
                        data.template === 'about.html' ? compiledAboutTemplate :
                        compiledBaseTemplate;
        const html = applyTemplate(template, data);
        const outputPath = `dist/${file.replace('.md', '.html')}`;
        fs.outputFileSync(outputPath, html);
    }); 