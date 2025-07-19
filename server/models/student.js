import mongoose, { Schema } from 'mongoose';
import User from './user.js';
import {
  Education_Systems
} from '../models/constants.js'
import {
  validateEducationStructure_one,
  validateSector
} from '../services/validation.service.js'

const StudentSchema = new Schema({
  education_system: {
    type: String,
    required: [true, "Student's education system is not specified"],
    enum: Education_Systems
  },
  grade: {
    type: String,
    required: [true, "Student's grade isn't specified"],
    validate: {
      validator: function(v){
        return validateEducationStructure_one("grades", v, this.education_system)
      },
      message: "Grade is invalid for the selected education system",
    },
  },
  sector: {
    type: String,
    required: [true, "Student's sector isn't specified"],
    validate: {
      validator: function(v){
        return validateSector(v, this.grade, this.education_system)
      },
      message: "Sector doesn't match the student's grade and education system",
    },
  },
  language: {
    type: String,
    required: [true, "Studying language isn't specified"],
    validate: {
      validator: function (lang) {
        return validateEducationStructure_one("languages", lang, this.education_system);
      },
      message: "Invalid studying language",
    },
  },
  wishlist_id: {
    required: true,
    type: mongoose.Types.ObjectId,
    ref: "Wishlist"
  }
}, { timestamps: true });

const Student = User.discriminator("Student", StudentSchema);
export default Student;

