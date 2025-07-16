import mongoose, { Schema } from 'mongoose';
import { User } from './user.js';
import {
  validateEducationStructure_many
} from '../services/validation.service.js'

import {
  Education_Systems
} from './constants.js'

const TeacherSchema = new Schema({
  social_media: { type: [String] },
  address: { type: String, required: true },
  about_me: { type: String, required: true },

  education_system: {
    type: [String],
    required: [true, "Please select an education system"],
    enum: Education_Systems
  },

  subject_profiles: [{
    type: [mongoose.Types.ObjectId],
    ref: 'SubjectProfile',
  }],

  experience_years: {
    type: Number,
    default: 0,
    required: true,
  },

  grades: {
    type: [String],
    validate: {
      validator: function (grades){
        return validateEducationStructure_many("grades", grades, this.education_system)
      },
      message: "One or more selected grades are invalid for the selected education system"
    },
    required: true,
  },

  languages: {
    type: [String],
    validate: {
      validator: function (languages) {
        return validateEducationStructure_many("languages", languages, this.education_system)
      },
      message: "One or more selected languages are invalid",
    },
    required: true,
  },

  sectors: {
    type: [String],
    validate: {
      validator: function (value) {
        return Array.isArray(value) &&
          value.every(sector =>
            (this.grades || []).every(grade =>
              validateSector(sector, grade, this.education_system)
            )
          );
      },
      message: "One or more sectors are invalid for the selected grades and education system",
    },
    required: true,
  },

  rating: {
    type: Number,
    required: true,
    default: 0
  },

  enrollments: {
    type: [mongoose.Types.ObjectId],
    ref: 'Enrollment'
  },

  enrollmentsRequests: {
    type: [mongoose.Types.ObjectId],
    ref: 'EnrollmentRequest'
  }
}, {
  timestamps: true,
});

const EnrollmentSchema = new Schema({
  studentId: {required: true, type: mongoose.Types.ObjectId, ref: 'Student'},
  tutorId: {required: true, type: mongoose.Types.ObjectId, ref: 'Teacher'},
  enrolledSince: {required: true, type: Date, default: Date.now}
})
const EnrollmentRequestSchma = new Schema({
  studentId: {required: true, type: mongoose.Types.ObjectId, ref: 'Student'},
  tutorId: {required: true, type: mongoose.Types.ObjectId, ref: 'Teacher'}
})

export const Enrollment = mongoose.model('Enrollment', EnrollmentSchema)
export const EnrollmentRequest = mongoose.model('EnrollmentRequest', EnrollmentRequestSchma)
export const Teacher = User.discriminator('Teacher', TeacherSchema);
