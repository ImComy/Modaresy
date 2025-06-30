import express from "express"
import main from "./users/authentication.js"
import tutors from "./tutors.js"
import students from "./students.js"
import admins from "./admins.js"
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

await mongoose.connect('mongodb://localhost:27017/eduDB')
.then(() => console.log("Database Connected!"))
.catch(err => console.error("Connection error:", err));

const app = express();
const port = process.env.port;
app.use(express.json());
app.use(cookieParser());

app.use('/auth', main)
app.use('/tutors', tutors)
app.use('/students', students)
app.use('/admins', admins)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})