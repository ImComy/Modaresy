import express from "express"
import main from "./users/authentication.js"
import tutors from "./tutors.js"
import students from "./students.js"
import admins from "./admins.js"

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = process.env.port;
app.use(express.json());

app.use('/auth', main)
app.use('/tutors', tutors)
app.use('/students', students)
app.use('/admins', admins)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})