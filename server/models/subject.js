import mongoose, { Schema } from 'mongoose';
import {
  validateEducationStructure_one,
  validateSector
} from '../services/validation.service.js';
import { PricePeriod, PaymentTimings, PaymentMethods } from './constants.js';

const SubjectSchema = new Schema({
  name: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  grade: {
    type: String,
    required: true,
    validate: {
      validator(value) {
        return validateEducationStructure_one("grades", value, this.education_system);
      },
      message: "Invalid grade for the selected education system"
    }
  },
  sector: {
    type: String,
    validate: {
      validator(value) {
        if (!value) return true;
        return validateSector(value, this.grade, this.education_system);
      },
      message: "Invalid sector for the selected grade and education system"
    }
  },
  language: {
    type: String,
    required: true,
    validate: {
      validator(value) {
        return validateEducationStructure_one("languages", value, this.education_system);
      },
      message: "Invalid language for the given education system"
    }
  },
  education_system: { type: String, required: true },
  years_experience: { type: Number, default: 0, min: 0 },
});

const SubjectProfileSchema = new Schema({
  subject_id: { type: mongoose.Types.ObjectId, ref: 'Subject', required: true },
  teacher_id: { type: mongoose.Types.ObjectId, ref: 'Teacher', required: true },
  user_type: { type: String, enum: ["tutor", "student"], required: true },
  description: String,
  group_pricing: { 
    price: { type: Number, min: 0 },
    price_period: { type: String, enum: PricePeriod },
    offer: {  
      percentage: Number,
      from: String,
      to: String,
      description: String
    }
  },
  private_pricing: { 
    price: Number,
    price_period: { type: String, enum: PricePeriod },
    note: String,
    offer: {  
      percentage: Number,
      from: String,
      to: String,
      description: String
    }
  },
  additional_pricing: [{  
    name: String,
    price: Number,
    period: { type: String, enum: PricePeriod },
    description: String,
    offer: {  
      percentage: Number,
      from: String,
      to: String,
      description: String
    }
  }],
  payment_methods: { 
    type: [String], 
    enum: PaymentMethods, 
    validate: {
      validator: methods => methods.length > 0,
      message: "At least one payment method is required"
    },
    default: ['Cash'] 
  },
  payment_timing: { 
    type: String, 
    enum: PaymentTimings, 
    required: true, 
    default: "Postpaid" 
  },
  groups: { type: [mongoose.Types.ObjectId], ref: 'Group', default: [] },
  session_duration: { type: Number, min: 0 },
  lectures_per_week: { type: Number, min: 0 },
  reviews: { type: [mongoose.Types.ObjectId], ref: 'Review', default: [] },
  youtube: [{
    title: { type: String, required: true },
    url: { 
      type: String, 
      required: true,
      validate: {
        validator: v => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(v),
        message: "Invalid YouTube URL"
      }
    }
  }],
  content: { type: [String], default: [] }
}, { timestamps: true });

export const Subject = mongoose.model("Subject", SubjectSchema);
export const SubjectProfile = mongoose.model("SubjectProfile", SubjectProfileSchema);
