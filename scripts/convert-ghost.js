const fs = require('fs-extra');
const path = require('path');
const TurndownService = require('turndown');
const slugify = require('slugify');
const fetch = require('node-fetch');

const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

// Function to download an image
async function downloadImage(url, filename) {
    try {
        // Create images directory if it doesn't exist
        const imageDir = path.join(__dirname, '..', 'src', 'static', 'images', 'blog');
        await fs.ensureDir(imageDir);

        const response = await fetch(url);
        const buffer = await response.buffer();
        await fs.writeFile(path.join(imageDir, filename), buffer);
        
        console.log(`Downloaded image: ${filename}`);
        return `/static/images/blog/${filename}`;
    } catch (error) {
        console.error(`Failed to download image ${url}:`, error);
        return url;
    }
}

// Modified image handling
async function processContent(content) {
    const $ = require('cheerio').load(content);
    
    // Process all images first
    const imagePromises = [];
    $('img').each((i, elem) => {
        let src = $(elem).attr('src') || '';
        
        if (src.includes('__GHOST_URL__')) {
            const ghostPath = src.split('__GHOST_URL__')[1];
            src = `https://www.ernsterlanson.com${ghostPath}`;
        }

        if (src) {
            const filename = src.split('/').pop();
            const promise = downloadImage(src, filename).then(newPath => {
                $(elem).attr('src', newPath);
            });
            imagePromises.push(promise);
        }
    });

    // Wait for all images to be processed
    await Promise.all(imagePromises);
    
    return $.html();
}

// Read the Ghost export file
const ghostExport = require('./ernst-erlanson.ghost.2025-02-26-13-54-23.json');

// Process each post
async function convertPosts() {
    const posts = ghostExport.db[0].data.posts;
    
    if (!posts) {
        console.log('No posts found in export file');
        return;
    }

    // Filter for only published posts
    const publishedPosts = posts.filter(post => post.status === 'published');
    console.log(`Found ${publishedPosts.length} published posts out of ${posts.length} total posts`);

    for (const post of publishedPosts) {
        const title = post.title;
        const date = post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : null;
        const content = post.html || post.markdown || '';
        
        // Process content and handle images before converting to markdown
        const processedContent = await processContent(content);
        const markdown = turndown.turndown(processedContent);
        
        // Create front matter
        const frontMatter = [
            '---',
            `title: ${title}`,
            `date: ${date}`,
            'author: Ernst Erlanson',
            '---',
            '',
            markdown
        ].join('\n');
        
        // Create filename
        const filename = slugify(title, {
            lower: true,
            strict: true
        }) + '.md';
        
        // Save the file
        const outputPath = path.join(__dirname, '..', 'src', 'content', 'blog', filename);
        await fs.outputFile(outputPath, frontMatter);
        
        console.log(`Converted: ${filename}`);
    }
}

convertPosts().then(() => {
    console.log('All posts converted successfully');
}).catch(console.error); 