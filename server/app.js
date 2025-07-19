import express from "express"
import users from "./routes/users.js"
import tutors from "./routes/tutors.js"
import students from "./routes/students.js"
import admins from "./routes/admins.js"
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import cors from 'cors';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

await mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Database Connected!"))
.catch(err => console.error("Connection error:", err));

const app = express();
const port = process.env.port;
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use('/users', users)
app.use('/tutors', tutors)
app.use('/students', students)
app.use('/admins', admins)

app.listen(port, () => {
  console.log(`Modaresy is listening on port ${port}`)
})