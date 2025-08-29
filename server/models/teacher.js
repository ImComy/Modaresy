import mongoose, { Schema } from 'mongoose';
import User from './user.js';
import { Subject } from './subject.js';

const TeacherSchema = new Schema({
  social_media: { 
    type: Map, 
    of: String, 
    default: new Map() 
  },
  address: { type: String, required: false },
  about_me: { type: String, required: false },

  profile_picture: {
    filename: { type: String, required: false },
    originalname: { type: String, required: false },
    path: { type: String, required: false },
    url: { type: String, required: false }
  },
  banner: {
    filename: { type: String, required: false },
    originalname: { type: String, required: false },
    path: { type: String, required: false },
    url: { type: String, required: false }
  },

  location_coordinates: {
    latitude: { 
      type: Number, 
      required: false,
      min: -90,
      max: 90
    },
    longitude: { 
      type: Number, 
      required: false,
      min: -180,
      max: 180
    }
  },
  
  subjects: [{
    type: mongoose.Types.ObjectId,
    ref: 'Subject',
  }],
  
  subject_profiles: [{
    type: mongoose.Types.ObjectId,
    ref: 'SubjectProfile',
  }],

  experience_years: {
    type: Number,
    default: 0,
    required: false,
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
  },
  
  availability: {
    type: mongoose.Types.ObjectId,
    ref: 'PersonalAvailability',
    required: false
  }
}, {
  timestamps: true,
});

const EnrollmentSchema = new Schema({
  studentId: { required: true, type: mongoose.Types.ObjectId, ref: 'Student' },
  tutorId: { required: true, type: mongoose.Types.ObjectId, ref: 'Teacher' },
  enrolledSince: { required: true, type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
});

const EnrollmentRequestSchma = new Schema({
  studentId: { required: true, type: mongoose.Types.ObjectId, ref: 'Student' },
  tutorId: { required: true, type: mongoose.Types.ObjectId, ref: 'Teacher' },
  requestedAt: { required: true, type: Date, default: Date.now }
});

export const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);
export const EnrollmentRequest = mongoose.model('EnrollmentRequest', EnrollmentRequestSchma);
export const Teacher = User.discriminator('Teacher', TeacherSchema);

TeacherSchema.pre('save', async function (next) {
  try {
    if (Array.isArray(this.subjects) && this.subjects.length > 0) {
      const subs = await Subject.find({ _id: { $in: this.subjects } }).select('years_experience').lean();
      const maxYears = subs.reduce((max, s) => Math.max(max, (s && s.years_experience) || 0), 0);
      this.experience_years = maxYears;
    } else {
      this.experience_years = 0;
    }
    next();
  } catch (err) {
    next(err);
  }
});
