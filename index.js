const path = require('path');
const express = require('express');
const favicon = require('serve-favicon');
const app = express();
const PORT = process.env.PORT || 3000;

const publicPath = path.resolve(`${__dirname}/public`);
const assetsPath = path.resolve(`${publicPath}/assets`);
const faviconPath = path.resolve(`${assetsPath}/favicon`);

// set your static server
app.use(express.static(publicPath));

// set the favicon
app.use(favicon(path.join(faviconPath, 'favicon.ico')));

// views
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

// start listening
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
})