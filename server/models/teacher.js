import mongoose, { Schema } from 'mongoose';
import User from './user.js';
import { Subject } from './subject.js';

const CoordinatesSchema = new Schema(
  {
    latitude: {
      type: Number,
      min: -90,
      max: 90,
      required: false,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
      required: false,
    },
  },
  { _id: false }
);

const FileSchema = new Schema(
  {
    filename: { type: String, required: false },
    originalname: { type: String, required: false },
    path: { type: String, required: false },
    url: { type: String, required: false },
  },
  { _id: false }
);

const TeacherSchema = new Schema(
  {
    social_media: {
      type: Map,
      of: String,
      default: new Map(),
    },

    address: { type: String, required: false },
    about_me: { type: String, required: false },

    profile_picture: {
      type: FileSchema,
      required: false,
      set: (v) => {
        if (v === '' || (typeof v === 'string' && (v.startsWith('blob:') || v.startsWith('data:')))) return undefined;
        return v;
      },
    },
    banner: {
      type: FileSchema,
      required: false,
      set: (v) => {
        if (v === '' || (typeof v === 'string' && (v.startsWith('blob:') || v.startsWith('data:')))) return undefined;
        return v;
      },
    },
    location_coordinates: { type: CoordinatesSchema, required: false },
    governate: { type: String, required: false },
    district: { type: String, required: false },

    subjects: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Subject',
      },
    ],

    subject_profiles: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'SubjectProfile',
      },
    ],

    // simple casual property for tutor's total experience (moved from subject-level logic)
    experience_years: {
      type: Number,
      default: 0,
      required: false,
    },

    // YouTube links for the tutor (moved from subject_profile)
    youtube: [
      {
        title: { type: String, required: false },
        url: {
          type: String,
          required: false,
          validate: {
            validator: v => v == null || v === '' || /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(v),
            message: 'Invalid YouTube URL'
          }
        }
      }
    ],

    // Payment settings moved from SubjectProfile to Teacher (global for tutor)
    payment_methods: { 
      type: [String], 
      required: false,
      default: [],
    },

    payment_timing: {
      type: String,
      required: false,
    },

    rating: {
      type: Number,
      required: true,
      default: 0,
    },

    enrollments: {
      type: [mongoose.Types.ObjectId],
      ref: 'Enrollment',
      default: [],
    },

    enrollmentsRequests: {
      type: [mongoose.Types.ObjectId],
      ref: 'EnrollmentRequest',
      default: [],
    },

    availability: {
      type: mongoose.Types.ObjectId,
      ref: 'PersonalAvailability',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const EnrollmentSchema = new Schema({
  studentId: { required: true, type: mongoose.Types.ObjectId, ref: 'Student' },
  tutorId: { required: true, type: mongoose.Types.ObjectId, ref: 'Teacher' },
  enrolledSince: { required: true, type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
});

const EnrollmentRequestSchema = new Schema({
  studentId: { required: true, type: mongoose.Types.ObjectId, ref: 'Student' },
  tutorId: { required: true, type: mongoose.Types.ObjectId, ref: 'Teacher' },
  requestedAt: { required: true, type: Date, default: Date.now },
});

export const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);
export const EnrollmentRequest = mongoose.model(
  'EnrollmentRequest',
  EnrollmentRequestSchema
);

export const Teacher = User.discriminator('Teacher', TeacherSchema);

// experience_years is now a simple property on the Teacher model.
