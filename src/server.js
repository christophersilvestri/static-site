const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const dotenv = require('dotenv');

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

// Routes
app.get('/', (req, res) => {
    res.render('home', {
        title: 'Home',
        layout: 'main'
    });
});

app.get('/blog', (req, res) => {
    res.render('blog', {
        title: 'Blog',
        layout: 'main'
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact',
        layout: 'main'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 