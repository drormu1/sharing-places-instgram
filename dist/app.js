"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const express_handlebars_1 = require("express-handlebars");
const path_1 = __importDefault(require("path"));
const canvas_1 = require("canvas");
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000; // Use environment variable PORT or default to 3000
// Configure Handlebars as the view engine
app.engine('handlebars', (0, express_handlebars_1.engine)({
    layoutsDir: path_1.default.join(__dirname, 'views'),
}));
app.set('view engine', 'handlebars');
app.set('views', path_1.default.join(__dirname, 'views')); // Assuming your views folder is in the src directory
// Middleware to parse JSON request bodies
app.use(express_1.default.json());
// GET endpoint that renders a Handlebars view
app.get('/', (req, res) => {
    res.render('main', { title: 'Welcome!', message: 'Hello from Handlebars!' });
});
// Your existing API endpoints
app.get('/api/data', (req, res) => {
    const data = { message: 'Hello from the GET endpoint!' };
    res.json(data);
});
app.post('/api/data', (req, res) => {
    const receivedData = req.body;
    console.log('Received data:', receivedData);
    res.json({ message: 'Data received successfully!', data: receivedData });
});
// Route to handle form submission
app.post('/api/submit', async (req, res) => {
    const inputField = `${req.body.text} - ${new Date().toISOString()}`;
    if (!inputField) {
        return res.status(400).send('Input field is required.');
    }
    try {
        // Load the background image
        const backgroundPath = path_1.default.join(__dirname, 'background', 'background.jpg');
        const image = await (0, canvas_1.loadImage)(backgroundPath);
        // Create a canvas with the same dimensions as the background image
        const canvas = (0, canvas_1.createCanvas)(image.width, image.height);
        const ctx = canvas.getContext('2d');
        // Draw the background image onto the canvas
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        // Add the inputField text as a layer on the canvas
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(inputField, 50, 50);
        // Generate a unique filename using GUID
        const uniqueFilename = `${(0, uuid_1.v4)()}.jpg`;
        const outputPath = path_1.default.join(__dirname, 'static', uniqueFilename);
        // Save the resulting image
        const out = fs_1.default.createWriteStream(outputPath);
        const stream = canvas.createJPEGStream();
        stream.pipe(out);
        out.on('finish', () => {
            res.json({ message: 'Image generated successfully!', filePath: `http://${req.hostname}:${port}/static/${uniqueFilename}` });
        });
    }
    catch (error) {
        console.error('Error generating image:', error);
        res.status(500).send('Error generating image.');
    }
});
// Serve static files from the "static" directory
app.use('/static', express_1.default.static(path_1.default.join(__dirname, 'static')));
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
