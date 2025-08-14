import mongoose, { Schema } from 'mongoose';
import User from './user.js';

const TeacherSchema = new Schema({
  social_media: { 
    type: Map, 
    of: String, 
    default: new Map() 
  },
  address: { type: String, required: false },
  about_me: { type: String, required: false },
  
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
