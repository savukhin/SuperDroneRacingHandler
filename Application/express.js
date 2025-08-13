const express = require('express');
const path = require('path');

// import jQuery from 'jquery';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'Application' directory
app.use("/", express.static(path.join(__dirname)));
console.log(`"${path.join(__dirname, 'node_modules','jquery','dist')}"`)
app.use('/jquery',  express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist'))); // redirect JS jquery

// app.use(express.static(path.join(__dirname, 'Application')));

// Route to serve index.html
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));
// });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
