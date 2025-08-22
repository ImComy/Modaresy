import express from "express"
import users from "./routes/users.js"
import tutors from "./routes/tutors.js"
import students from "./routes/students.js"
import admins from "./routes/admins.js"
import constants from "./routes/constants.js"
import Subjects from "./routes/subjects.js"
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import cors from 'cors';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import dotenv from 'dotenv';
import { initializeUserStatsCache } from './events/user_stats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

await mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Database Connected!"))
.catch(err => console.error("Connection error:", err));

const app = express();
// Use standard PORT env var (Railway sets PORT) or fall back to .env port or 3000
const port = process.env.PORT || process.env.port || 3000;
app.use(express.json());
app.use(cookieParser());

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use('/users', users)
app.use('/tutors', tutors)
app.use('/students', students)
app.use('/admins', admins)
app.use('/constants', constants)
app.use('/subjects', Subjects)
initializeUserStatsCache();

// If there is a client build, serve it from /dist when in production
const distPath = path.join(__dirname, '../dist');
if (process.env.NODE_ENV === 'production' || process.env.SERVE_CLIENT === 'true') {
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(port, () => {
  console.log(`Modaresy is listening on port ${port}`)
})