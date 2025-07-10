import mongoose, { Schema } from 'mongoose';
import validator from 'validator';
import { validateUserType, validateGovernate } from '../utils/constantsValidation.js';
const { isEmail, isMobilePhone } = validator;
export const options = { discriminatorKey: 'type', collection: 'Users' };

const UserSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "The Username is missing!"]
  },

  type: {
    type: String,
    required: [true, "User type isn't specified!"],
    validate: {
      validator: validateUserType,
      message: "Invalid user type selected!"
    }
  },

  email: {
    type: String,
    required: [true, "Email is required!"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: isEmail,
      message: "The email you entered is invalid!"
    }
  },

  phone_number: {
    type: String,
    required: [true, "Phone number is missing!"],
    unique: true,
    trim: true,
    validate: {
      validator: (value) => isMobilePhone(value, "ar-EG"),
      message: "The phone number is invalid!"
    }
  },

  password: {
    type: String,
    required: [true, "Password is missing!"]
  },

  wishlist_id: {
    type: Schema.Types.ObjectId,
    ref: 'Wishlist',
    required: true,
    unique: true
  },

  governate: {
    type: String,
    required: [true, "Please select your governate"],
    validate: {
      validator: validateGovernate,
      message: "Invalid governate selected!"
    }
  },

  last_login: {
    type: Date,
    default: null
  },

  verified: {
    type: Boolean,
    default: false
  },

  verificationCode: {
    type: String
  },

  codeExpiresAt: {
    type: Date
  }
}, {
  ...options,
  timestamps: true
});

export const User = mongoose.model("User", UserSchema);
