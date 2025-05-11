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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const port = process.env.PORT || 3000; // Use PORT from .env or default to 3000
const publicDir = process.env.PUBLIC_DIR || 'public'; // Use PUBLIC_DIR from .env or default to 'public'
const app = (0, express_1.default)();
app.use('/static', express_1.default.static(path_1.default.join(__dirname, `../${publicDir}`)));
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
        const backgroundPath = path_1.default.join(__dirname, '../public', 'images', 'background.jpg');
        console.log('Background image path:', backgroundPath);
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
        const outputPath = path_1.default.join(__dirname, '../public', 'postcards', uniqueFilename);
        console.log('Output image path:', outputPath);
        // Save the resulting image
        const out = fs_1.default.createWriteStream(outputPath);
        const stream = canvas.createJPEGStream();
        stream.pipe(out);
        out.on('finish', () => {
            res.json({ message: 'Image generated successfully!', filePath: `http://${req.hostname}:${port}/static/postcards/${uniqueFilename}` });
        });
    }
    catch (error) {
        console.error('Error generating image:', error);
        res.status(500).send('Error generating image.');
    }
});
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
