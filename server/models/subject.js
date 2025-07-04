import mongoose, { Schema } from 'mongoose';
import {
  validateGrade,
  validateSector,
  validateLanguage,
  validateSubject,
  validateEducationSystem,
  validateUserType
} from '../utils/constantsValidation.js';
import { PricePeriod, PaymentTiming, PaymentMethods } from './constants.js';

const SubjectSchema = new Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return validateSubject(this.education_system, this.grade, value, this.sector);
      },
      message: "Invalid subject for the given education system, grade, and sector"
    }
  },
  grade: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return validateGrade(this.education_system, value);
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
        return validateSector(this.education_system, this.grade, value);
      },
      message: "Invalid sector for the selected grade and education system"
    }
  },
  language: {
    type: String,
    required: true,
    validate: {
      validator: validateLanguage,
      message: "Invalid language"
    }
  },
  education_system: {
    type: String,
    required: true,
    validate: {
      validator: validateEducationSystem,
      message: "Invalid education system"
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
      validator: validateUserType,
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
    enum: PaymentTiming,
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