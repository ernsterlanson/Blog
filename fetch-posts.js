const fetch = require('node-fetch');
const cheerio = require('cheerio');
const TurndownService = require('turndown');
const fs = require('fs-extra');
const path = require('path');
const slugify = require('slugify');
const https = require('https');

const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

// Add custom rule to handle images
turndown.addRule('images', {
    filter: ['img'],
    replacement: function (content, node) {
        const alt = node.alt || '';
        const src = node.src || '';
        // Download the image if it's from your domain
        if (src.includes('ernsterlanson.com')) {
            downloadImage(src);
        }
        return `![${alt}](${src})`;
    }
});

// Function to download images
async function downloadImage(url) {
    const filename = url.split('/').pop();
    const imagePath = path.join(__dirname, 'src', 'static', 'images', 'blog', filename);
    
    // Create images directory if it doesn't exist
    fs.ensureDirSync(path.join(__dirname, 'src', 'static', 'images', 'blog'));

    return new Promise((resolve, reject) => {
        https.get(url, response => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(imagePath);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`Downloaded: ${filename}`);
                    resolve();
                });
            } else {
                reject(`Failed to download ${url}`);
            }
        }).on('error', reject);
    });
}

// First, get all post URLs from the main page
async function getPostUrls() {
    try {
        const response = await fetch('https://www.ernsterlanson.com');
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Find all links that look like blog posts
        const urls = [];
        $('.post-card a').each((i, element) => {
            const href = $(element).attr('href');
            if (href && href.includes('ernsterlanson.com/') && 
                !href.match(/\/(about|media|now|contact)$/) && 
                !href.includes('#') && 
                !href.includes('/tag/')) {
                urls.push(href);
            }
        });
        
        console.log('Found URLs:', urls); // Debug line to see what we're finding
        
        return [...new Set(urls)]; // Remove duplicates
    } catch (error) {
        console.error('Error fetching main page:', error);
        return [];
    }
}

async function fetchPost(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const title = $('h1').first().text().trim();
        const dateStr = $('time').first().text() || 
                       new Date().toISOString().split('T')[0];
        
        // Get the main content
        const content = $('article').first();
        
        // Remove unwanted elements
        content.find('script, style, time, h1').remove();
        // Remove the specific elements we don't want
        content.find('img[src*="gravatar.com"]').remove();  // Remove gravatar image
        content.find('a[href*="/author/"]').parent().remove();  // Remove author link
        content.find('a[href*="/tag/newsletter"]').remove();  // Remove newsletter link
        content.find('a:contains("← Previous")').remove();  // Remove previous link
        
        // Convert HTML to Markdown
        const markdown = turndown.turndown(content.html() || '');
        
        // Create front matter
        const frontMatter = [
            '---',
            `title: ${title}`,
            `date: ${dateStr}`,
            'author: Ernst Erlanson',
            '---',
            '',
            markdown
        ].join('\n');
        
        // Create a filename from the title
        const filename = slugify(title, {
            lower: true,
            strict: true
        }) + '.md';
        
        // Save the file
        const outputPath = path.join(__dirname, 'src', 'content', 'blog', filename);
        await fs.outputFile(outputPath, frontMatter);
        
        console.log(`Successfully saved: ${filename}`);
        
    } catch (error) {
        console.error(`Error processing ${url}:`, error);
    }
}

async function fetchAllPosts() {
    const urls = await getPostUrls();
    console.log(`Found ${urls.length} posts to process`);
    
    for (const url of urls) {
        console.log(`Processing: ${url}`);
        await fetchPost(url);
        // Add a small delay between requests to be nice to the server
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Start the process
fetchAllPosts().then(() => {
    console.log('All posts have been processed');
}).catch(console.error); 