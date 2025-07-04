import { Schema } from 'mongoose';
import { User } from './user.js';

import {
  validateEducationSystem,
  validateGrade,
  validateSector,
  validateLanguage
} from '../utils/educationValidators.js';

const StudentSchema = new Schema({
  education_system: {
    type: String,
    required: [true, "Student's education system is not specified"],
    validate: {
      validator: function (value) {
        return validateEducationSystem(value);
      },
      message: "Invalid education system",
    },
  },
  grade: {
    type: String,
    required: [true, "Student's grade isn't specified"],
    validate: {
      validator: function (grade) {
        return validateGrade(this.education_system, grade);
      },
      message: "Grade is invalid for the selected education system",
    },
  },
  sector: {
    type: String,
    required: [true, "Student's sector isn't specified"],
    validate: {
      validator: function (sector) {
        return validateSector(this.education_system, this.grade, sector);
      },
      message: "Sector doesn't match the student's grade and education system",
    },
  },
  language: {
    type: String,
    required: [true, "Studying language isn't specified"],
    validate: {
      validator: function (lang) {
        return validateLanguage(lang);
      },
      message: "Invalid studying language",
    },
  },
}, { timestamps: true });

export const Student = User.discriminator("Student", StudentSchema);
