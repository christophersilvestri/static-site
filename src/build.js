const fs = require('fs');
const path = require('path');
const exphbs = require('express-handlebars');
const matter = require('gray-matter');
const marked = require('marked');

// Set up Handlebars
const hbs = exphbs.create({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'layouts'),
    partialsDir: path.join(__dirname, 'components'),
    extname: '.handlebars',
});

const viewsDir = path.join(__dirname, 'pages');
const distDir = path.join(__dirname, '../dist');
const blogDir = path.join(__dirname, '../content/blog');
const pagesDir = path.join(__dirname, '../content/pages');

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);
if (!fs.existsSync(path.join(distDir, 'blog'))) fs.mkdirSync(path.join(distDir, 'blog'));

// Helper to get all blog posts
function getBlogPosts() {
    const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
    return files.map(filename => {
        const filePath = path.join(blogDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);
        const paragraphs = content.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
        const excerpt = paragraphs.find(p => !p.startsWith('#')) || '';
        return {
            ...data,
            slug: data.slug || filename.replace(/\.md$/, ''),
            excerpt,
            date: data.date || '',
            content,
        };
    });
}

async function renderPage(template, context, outPath) {
    const templatePath = path.join(viewsDir, `${template}.handlebars`);
    const source = fs.readFileSync(templatePath, 'utf-8');
    const compiled = hbs.handlebars.compile(source);
    // Add currentYear for layout
    context.currentYear = new Date().getFullYear();
    const html = compiled(context);
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log('Generated:', outPath);
}

(async () => {
    // Home page
    await renderPage('home', { title: 'Home', layout: 'main' }, path.join(distDir, 'index.html'));

    // Blog list
    const posts = getBlogPosts().sort((a, b) => new Date(b.date) - new Date(a.date));
    await renderPage('blog', { title: 'Blog', layout: 'main', posts }, path.join(distDir, 'blog', 'index.html'));

    // Individual blog posts
    for (const post of posts) {
        const htmlContent = marked.parse(post.content);
        await renderPage('post', {
            title: post.title,
            layout: 'main',
            content: htmlContent,
            date: post.date
        }, path.join(distDir, 'blog', `${post.slug}.html`));
    }

    // Individual static pages from markdown
    if (fs.existsSync(pagesDir)) {
        const pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.md'));
        for (const filename of pageFiles) {
            const filePath = path.join(pagesDir, filename);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const { data, content } = matter(fileContent);
            const htmlContent = marked.parse(content);
            const slug = data.slug || filename.replace(/\.md$/, '');
            await renderPage('page', {
                title: data.title || slug,
                layout: 'main',
                content: htmlContent
            }, path.join(distDir, `${slug}.html`));
        }
    }

    // Copy static assets (css, js, images)
    const publicDir = path.join(__dirname, '../public');
    function copyRecursive(src, dest) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        for (const file of fs.readdirSync(src)) {
            const srcPath = path.join(src, file);
            const destPath = path.join(dest, file);
            if (fs.lstatSync(srcPath).isDirectory()) {
                copyRecursive(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
    copyRecursive(publicDir, distDir);

    console.log('Static site build complete!');
})(); 