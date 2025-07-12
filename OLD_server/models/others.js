import mongoose, { Schema } from 'mongoose';
import {weekDays} from './constants.js';

export const TimesSchema = new Schema({
  days: { type: [String], required: true, enum: weekDays},
  hours: { type: String, required: true }
});

export const WishlistSchema = new Schema({
  ids_of_teachers: {
    type: [mongoose.Types.ObjectId],
    ref: 'Teacher',
    required: true
  }
});

export const AchievementSchema = new Schema({
  type: { type: String, required: true },   
  label: { type: String, required: true },  
  isCurrent: { type: Boolean, default: true }
});

export const PersonalAvailabilitySchema = new Schema({
  times: {
    type: [TimesSchema],
    default: [],
    required: true
  },
  note: {
    type: String,
    default: ""
  }
});
export const ReportSchema = new mongoose.Schema({
  Reporter_ID: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  Reported_ID: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  Reason: {
    type: String,
    required: true
  },
  Type: {
    type: String,
    enum: ['Tutor', 'Student', 'Other'],
    default: 'Tutor',
    required: true
  },
  Date: {
    type: Date,
    default: Date.now
  }
});

export const Report = mongoose.model("Report", ReportSchema);
export const Wishlist = mongoose.model("Wishlist", WishlistSchema);
export const Achievement = mongoose.model("Achievement", AchievementSchema);
export const PersonalAvailability = mongoose.model("PersonalAvailability", PersonalAvailabilitySchema);