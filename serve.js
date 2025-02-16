const express = require('express');
const app = express();
const port = 3000;

// Serve static files from the dist directory
app.use(express.static('dist'));

// Serve index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/dist/index.html');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 