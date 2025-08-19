import mongoose, { Schema } from 'mongoose';
import { PricePeriod, PaymentTimings, PaymentMethods } from './constants.js';

const ReviewSchema = new Schema({
  User_ID: { 
    type: mongoose.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  subject_profile: { 
    type: mongoose.Types.ObjectId, 
    ref: 'SubjectProfile', 
    required: true 
  },
  Rate: { type: Number, required: true, min: 1, max: 5 },
  Comment: String,
  createdAt: { type: Date, default: Date.now }
});

export const AdditionalPricingSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  period: { type: String, enum: PricePeriod, required: true },
  description: String,
});

export const PrivatePricingSchema = new Schema({
  price: { type: Number, required: true },
  note: String,
  price_period: { type: String, enum: PricePeriod, required: true }, 
});

export const GroupSchema = new Schema({
  Name: { type: String, required: true },
  Days: { type: [String], required: true },
  Time: { type: String, required: true },
  Status: { type: Boolean, default: true },
  additional_note: String,
});

export const YouTubeLinkSchema = new Schema({
  title: { type: String, required: true },
  link: {
    type: String,
    required: true,
    validate: {
      validator: v => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(v),
      message: "Invalid YouTube URL"
    }
  },
});

export const PaymentTimingSchema = new Schema({
  timing: { type: String, enum: PaymentTimings, required: true },
  method: { type: String, enum: PaymentMethods, required: true }
});

export const Review = mongoose.model('Review', ReviewSchema);
export const AdditionalPricing = mongoose.model('AdditionalPricing', AdditionalPricingSchema);
export const PrivatePricing = mongoose.model('PrivatePricing', PrivatePricingSchema);
export const Group = mongoose.model('Group', GroupSchema);
export const YouTubeLink = mongoose.model('YouTubeLink', YouTubeLinkSchema);
export const PaymentTiming = mongoose.model('PaymentTiming', PaymentTimingSchema);
