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

    profile_picture: { type: FileSchema, required: false },
    banner: { type: FileSchema, required: false },
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

    experience_years: {
      type: Number,
      default: 0,
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

TeacherSchema.pre('save', async function (next) {
  try {
    if (Array.isArray(this.subjects) && this.subjects.length > 0) {
      const subs = await Subject.find({ _id: { $in: this.subjects } })
        .select('years_experience')
        .lean();
      const maxYears = subs.reduce(
        (max, s) => Math.max(max, (s && s.years_experience) || 0),
        0
      );
      this.experience_years = maxYears;
    } else {
      this.experience_years = 0;
    }
    next();
  } catch (err) {
    next(err);
  }
});
