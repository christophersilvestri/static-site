const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const dotenv = require('dotenv');
const fs = require('fs');
const marked = require('marked');
const matter = require('gray-matter');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set up Handlebars
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'layouts'),
    partialsDir: path.join(__dirname, 'components')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'pages'));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper to get all blog posts
function getBlogPosts() {
    const postsDir = path.join(__dirname, '../content/blog');
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    return files.map(filename => {
        const filePath = path.join(postsDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);
        // Get first paragraph after title (skip headings and empty lines)
        const paragraphs = content.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
        const excerpt = paragraphs.find(p => !p.startsWith('#')) || '';
        return {
            ...data,
            slug: data.slug || filename.replace(/\.md$/, ''),
            excerpt,
            date: data.date || '',
        };
    });
}

// Routes
app.get('/', (req, res) => {
    res.render('home', {
        title: 'Home',
        layout: 'main'
    });
});

app.get('/blog', (req, res) => {
    const posts = getBlogPosts().sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log(posts);
    res.render('blog', {
        title: 'Blog',
        layout: 'main',
        posts
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact',
        layout: 'main'
    });
});

// Individual blog post page
app.get('/blog/:slug', (req, res) => {
    const postsDir = path.join(__dirname, '../content/blog');
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    const file = files.find(f => {
        const fileContent = fs.readFileSync(path.join(postsDir, f), 'utf-8');
        const { data } = matter(fileContent);
        return (data.slug || f.replace(/\.md$/, '')) === req.params.slug;
    });
    if (!file) {
        return res.status(404).send('Post not found');
    }
    const fileContent = fs.readFileSync(path.join(postsDir, file), 'utf-8');
    const { data, content } = matter(fileContent);
    const html = marked.parse(content);
    res.render('post', {
        title: data.title,
        layout: 'main',
        content: html,
        date: data.date
    });
});

app.get('/about', (req, res) => {
    const aboutPath = path.join(__dirname, '../content/pages/about.md');
    if (!fs.existsSync(aboutPath)) {
        return res.status(404).send('About page not found');
    }
    const fileContent = fs.readFileSync(aboutPath, 'utf-8');
    const { data, content } = matter(fileContent);
    const html = marked.parse(content);
    res.render('page', {
        title: data.title || 'About',
        layout: 'main',
        content: html
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 