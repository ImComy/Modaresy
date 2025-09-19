import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import axios from 'axios'; // You will need to install axios: npm install axios

import users from './routes/users.js';
import tutors from './routes/tutors.js';
import students from './routes/students.js';
import blogs from './routes/blogs.js';
import admins from './routes/admins.js';
import constants from './routes/constants.js';
import Subjects from './routes/subjects.js';
import storage from './routes/storage.js';
import { initializeUserStatsCache } from './events/user_stats.js';

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database Connected!'))
  .catch((err) => console.error('Connection error:', err));

const app = express();
const port = process.env.PORT || process.env.port || 3000;
app.use(express.json());
app.use(cookieParser());

app.use(
  cors(  {
    origin: ['https://www.modaresy.me', 'https://modaresy.me'],
    methods: ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"],
    // Allow Authorization and other common headers so preflight requests succeed
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ETag",
      "x-goog-generation",
      "x-goog-metageneration",
      "x-goog-storage-class",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Allow-Origin"
    ],
    exposedHeaders: ["Authorization", "ETag"],
    credentials: true,
  })
);

app.use('/users', users);
app.use('/tutors', tutors);
app.use('/students', students);
app.use('/blogs', blogs);
app.use('/admins', admins);
app.use('/constants', constants);
app.use('/subjects', Subjects);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/storage', storage);

// Add a proxy route to serve Google Cloud Storage images
app.get('/gcs-images/*', async (req, res) => {
  const gcsPath = req.params[0];
  const gcsUrl = `https://storage.googleapis.com/pfp-1/${gcsPath}`;
  try {
    const response = await axios.get(gcsUrl, { responseType: 'arraybuffer' });
    res.setHeader('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching image from GCS:', error);
    res.status(500).send('Error fetching image');
  }
});

initializeUserStatsCache();

const distPath = path.join(__dirname, '../dist');
if (process.env.NODE_ENV === 'production' || process.env.SERVE_CLIENT === 'true') {
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(port, () => {
  console.log(`Modaresy is listening on port ${port}`);
});
