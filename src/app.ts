// src/app.ts
import express, { Request, Response } from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const app = express();

app.use('/static', express.static(path.join(__dirname, '../public')));


const port = process.env.PORT || 3000; // Use environment variable PORT or default to 3000

// Configure Handlebars as the view engine
app.engine('handlebars', engine({
  layoutsDir: path.join(__dirname, 'views'),
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views')); // Assuming your views folder is in the src directory

// Middleware to parse JSON request bodies
app.use(express.json());

// GET endpoint that renders a Handlebars view
app.get('/', (req: Request, res: Response) => {
  res.render('main', { title: 'Welcome!', message: 'Hello from Handlebars!' });
});

// Your existing API endpoints
app.get('/api/data', (req: Request, res: Response) => {
  const data = { message: 'Hello from the GET endpoint!' };
  res.json(data);
});

app.post('/api/data', (req: Request, res: Response) => {
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
    const backgroundPath = path.join(__dirname, '../public', 'images', 'background.jpg');

    console.log('Background image path:', backgroundPath);
    const image = await loadImage(backgroundPath);

    // Create a canvas with the same dimensions as the background image
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // Draw the background image onto the canvas
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Add the inputField text as a layer on the canvas
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(inputField, 50, 50);

    // Generate a unique filename using GUID
    const uniqueFilename = `${uuidv4()}.jpg`;
    const outputPath = path.join(__dirname, '../public','postcards', uniqueFilename);
    console.log('Output image path:', outputPath);
    // Save the resulting image
    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createJPEGStream();
    stream.pipe(out);

    out.on('finish', () => {
      res.json({ message: 'Image generated successfully!', filePath: `http://${req.hostname}:${port}/static/postcards/${uniqueFilename}` });
    });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).send('Error generating image.');
  }
});

// Serve static files from the "static" directory
app.use('/static', express.static(path.join(__dirname, 'static')));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});