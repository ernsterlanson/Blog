const express = require('express');
const app = express();
const port = 3000;

// Serve static files from the dist directory
app.use('/Blog', express.static('dist'));

// Redirect root to /Blog/
app.get('/', (req, res) => {
    res.redirect('/Blog/');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/Blog/`);
}); 