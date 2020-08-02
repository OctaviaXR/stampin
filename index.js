const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// set your static server
const publicPath = path.resolve(`${__dirname}/public`);
app.use(express.static(publicPath));

// views
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

// start listening
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
})