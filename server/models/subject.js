import mongoose, { Schema } from 'mongoose';
import {
  validateEducationStructure_one,
  validateSector
} from '../services/validation.service.js';
import { PricePeriod, PaymentTimings, PaymentMethods } from './constants.js';

const SubjectSchema = new Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return validateEducationStructure_one("subjects", value, this.education_system);
      },
      message: "Invalid subject for the given education system"
    }
  },
  grade: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return validateEducationStructure_one("grades", value, this.education_system);
      },
      message: "Invalid grade for the selected education system"
    }
  },
  sector: {
    type: String,
    required: false,
    validate: {
      validator: function (value) {
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
      validator: function (value) {
        return validateEducationStructure_one("languages", value, this.education_system);
      },
      message: "Invalid language for the given education system"
    }
  },
  education_system: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return !!value && !!value.length; // Basic check; assume all education systems in EducationStructure
      },
      message: "Education system is required"
    }
  }
});

const SubjectProfileSchema = new Schema({
  subject_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Subject'
  },
  user_type: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return ["tutor", "student"].includes(value); // Simplified; adjust as needed
      },
      message: "Invalid user type"
    }
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  yearsExp: {
    type: Number,
    min: 0
  },
  description: {
    type: String
  },
  group_pricing: {
    type: Number,
    min: 0
  },
  price_period: {
    type: String,
    enum: PricePeriod,
    required: true
  },
  private_pricing: {
    type: mongoose.Types.ObjectId,
    ref: 'PrivatePricing'
  },
  offer_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Offer',
    default: null
  },
  payment_methods: {
    type: [String],
    enum: PaymentMethods,
    default: ['cash']
  },
  payment_timing: {
    type: String,
    enum: PaymentTimings,
    required: true
  },
  groups: {
    type: [mongoose.Types.ObjectId],
    ref: 'Group',
    default: []
  },
  session_duration: {
    type: Number,
    required: true,
    min: 0
  },
  lectures_per_week: {
    type: Number,
    required: true,
    min: 0
  },
  reviews: {
    type: [mongoose.Types.ObjectId],
    ref: 'Review',
    default: []
  },
  additional_pricing: {
    type: mongoose.Types.ObjectId,
    ref: 'AdditionalPricing',
    default: null
  },
  youtube: {
    type: [mongoose.Types.ObjectId],
    ref: 'YouTubeLink',
    default: []
  },
  content: {
    type: [String],
    default: []
  }
}, { timestamps: true });

export const Subject = mongoose.model("Subject", SubjectSchema);
export const SubjectProfile = mongoose.model("SubjectProfile", SubjectProfileSchema);
