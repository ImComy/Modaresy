import express from "express"
import users from "./routes/users.js"
import tutors from "./routes/tutors.js"
import students from "./routes/students.js"
import blogs from "./routes/blogs.js"
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
const port = process.env.PORT || process.env.port || 3000;
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ['https://www.modaresy.me', 'https://modaresy.me'],
    credentials: true,
  })
);

app.use('/users', users)
app.use('/tutors', tutors)
app.use('/students', students)
app.use('/blogs', blogs)
app.use('/admins', admins)
app.use('/constants', constants)
app.use('/subjects', Subjects)
initializeUserStatsCache();

const distPath = path.join(__dirname, '../dist');
if (process.env.NODE_ENV === 'production' || process.env.SERVE_CLIENT === 'true') {
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(port, () => {
  console.log(`Modaresy is listening on port ${port}`)
})