import mongoose, { Schema } from 'mongoose';
import { PricePeriod, PaymentTimings, PaymentMethods } from './constants.js';
import { 
  calculateSubjectProfileRating
 } from '../events/subject_profile.js';

// Offer Schema
export const OfferSchema = new Schema({
  percentage: { type: Number, required: true },
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  description: { type: String },
  for: { type: Number, required: true },
});

// Review Schema
const ReviewSchema = new Schema({
  User_ID: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  subject_profile: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'SubjectProfile'
  },
  Rate: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  Comment: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ReviewSchema.post('save', async function () {
  await calculateSubjectProfileRating(this.subject_profile, true);
});

ReviewSchema.post('remove', async function () {
  await calculateSubjectProfileRating(this.subject_profile, false);
});

// Additional Pricing Schema
export const AdditionalPricingSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  period: {
    type: String,
    enum: PricePeriod,
    required: true,
  },
  description: { type: String },
});

// Private Pricing Schema
export const PrivatePricingSchema = new Schema({
  price: { type: Number, required: true },
  note: { type: String },
  price_period: {
    type: String,
    enum: PricePeriod,
    required: true,
  },
});

// Group Schema
export const GroupSchema = new Schema({
  Name: { type: String, required: true },
  Days: { type: [String], required: true }, // example: ["Monday", "Wednesday"]
  Time: { type: String, required: true },    // or use Date/ISOTime depending on context
  Status: { type: Boolean, default: true },
  additional_note: { type: String },
});

// YouTube Link Schema
export const YouTubeLinkSchema = new Schema({
  title: { type: String, required: true },
  link: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(value);
      },
      message: "Invalid YouTube URL",
    },
  },
});

// Payment Timing Schema
export const PaymentTimingSchema = new Schema({
  timing: {
    type: String,
    enum: PaymentTimings,
    required: true,
  },
  method: {
    type: String,
    enum: PaymentMethods,
    required: true,
  }
});

// Register models
export const Offer = mongoose.model('Offer', OfferSchema);
export const Review = mongoose.model('Review', ReviewSchema);
export const AdditionalPricing = mongoose.model('AdditionalPricing', AdditionalPricingSchema);
export const PrivatePricing = mongoose.model('PrivatePricing', PrivatePricingSchema);
export const Group = mongoose.model('Group', GroupSchema);
export const YouTubeLink = mongoose.model('YouTubeLink', YouTubeLinkSchema);
export const PaymentTiming = mongoose.model('PaymentTiming', PaymentTimingSchema);