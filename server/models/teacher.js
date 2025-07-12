import mongoose, { Schema } from 'mongoose';
import { User } from './user.js';

const TeacherSchema = new Schema({
  social_media: { type: [String] },
  address: { type: String, required: true },

  isTop: { type: Boolean, default: false, required: true },
  isRecommended: { type: Boolean, default: false, required: true },
  isReady: { type: Boolean, default: false, required: true },

  about_me: { type: String, required: true },

  education_system: {
    type: [String],
    required: [true, "Please select an education system"],
    //enum: Education_Systems
  },

  subject_profiles: [{
    type: [mongoose.Types.ObjectId],
    ref: 'SubjectProfile',
  }],

  availability: {
    type: Schema.Types.ObjectId,
    ref: 'PersonalAvailability',
    default: null,
  },

  achievements: {
    type: Schema.Types.ObjectId,
    ref: 'Achievement',
    default: null,
  },

  experience_years: {
    type: Number,
    default: 0,
    required: true,
  },

  grades: {
    type: [String],
    /*validate: {
      validator: function (value) {
        return Array.isArray(value) &&
          value.every(grade => validateGrade(this.education_system, grade));
      },
      message: "One or more selected grades are invalid for the selected education system",
    },*/
    required: true,
  },

  languages: {
    type: [String],
    /*validate: {
      validator: function (value) {
        return Array.isArray(value) &&
          value.every(lang => validateLanguage(lang));
      },
      message: "One or more selected languages are invalid",
    },*/
    required: true,
  },

  sectors: {
    type: [String],
    /*validate: {
      validator: function (value) {
        return Array.isArray(value) &&
          value.every(sector =>
            (this.grades || []).every(grade =>
              validateSector(this.education_system, grade, sector)
            )
          );
      },
      message: "One or more sectors are invalid for the selected grades and education system",
    },*/
    required: true,
  },

  rating: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true,
});

export const Teacher = User.discriminator('Teacher', TeacherSchema);
