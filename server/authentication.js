import express from "express";
import mongoose, { Schema } from 'mongoose';
import { isEmail, isMobilePhone } from 'validator'

await mongoose.connect('mongodb://localhost:27017').then(() => console.log("Database Connected!"))

/////////////////////////////////////////////////////////
const User_Types = ["Teacher", "Student"]
const Grades = ["Secondary_1", "Secondary_2", "Secondary_3"]
const Sectors = {
  Secondary_1: ["General"],
  Secondary_2: ["Scientific", "Literature"],
  Secondary_3: ["Mathmatics", "Sciences"]
}
const Languages = ["Arabic", "English", "General"] 
const Governates = ["Ismailia"]
const Districts = {
  Ismailia: ["Elsheikh zayed", "Ard AlGamiaat", "Alkhamsa"]
}

function Sector_Validation(sectors, grades){
  if (!sectors) return false;
  let valids = 0;
  for (let i = 0; i < sectors.length; i++){
    for (let j = 0; j < grades.length; j++){
      const cur_grade = grades[j];
      const cur_sector = sectors[i];

      if (Sectors[cur_grade] && Sectors[cur_grade].includes(cur_sector)){
        valids+=1;
      }
    }
  }
  
  return valids >= sectors.length;
}

const User = new Schema({
    name : {type: String, required: [true, "The Username is missing!"]},
    type : {type: String, enum: User_Types, required: [true, "UserType isn't specified!"]},
    email: {
      type: String, 
      required: true,
      unique: true,
      validate: {
        validator: isEmail,
        message : "The email you entered is invalid!"
      }
    },
    phone_number : {
      type: String,
      required: [true, "Phone number is missing!"],
      unique: true,
      validate: {
        validator: (value) => isMobilePhone(value, "ar-EG"),
        message: "The Phone number is invalid!"
      }
    },
    password : {type: String, required: [true, "Password is missing!"]},
    Governate: {type: String, enum: Governates, required: [true, "Please select your governate"]},
    District: {
      type: String,
      required: true,
      validator: function(district){
        const governate = this.governate;
        return Districts[governate]?.includes(district);
      },
      message: props => `District ${props.value} is invalid or doesn't match with the governate`
    },
    Grades: {type: String, enum: Grades, required: [true, "Student's Grade isn't specified"]},
    Sectors: {
      type: Array,
      required: [true, "Please choose at least one sector"],
      validator: (value) => Sector_Validation(value, this.Grades),
      message: "The sector you chose doesn't match with your grade!"
    }
});

/////////////////////////////////////////////////////////

const router = express.Router();

router.post("/createAccount", (req, res) => {
  const body = req.body

});
router.get("/login/:email/:password", (req, res) => {
  
})
router.get("/profile", (req, res) => {
  
})
router.put("/updateProfile", (req, res) => {
  
})
router.delete("/logout", (req, res) => {
  
})

export default router;
