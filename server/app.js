import express from "express"
import main from "./users/authentication.js"
import tutors from "./tutors.js"
import students from "./students.js"
import admins from "./admins.js"
import dotenv from "dotenv"
dotenv.config()

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