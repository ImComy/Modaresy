import mongoose, { Schema } from 'mongoose';
import {
  userTypes
} from '../models/constants.js'
import {
  isEmail,
  validatePhoneNumber,
  validateDistrict
} from '../services/validation.service.js'

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
    enum: userTypes
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
      validator: validatePhoneNumber,
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
  },

  district: {
    type: String,
    required: [true, "Please select a valid district"],
    validate: {
      validator: function (value){
        validateDistrict(value, this.governate)
      },
      message: "Invalid district selected!"
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

const User = mongoose.model("User", UserSchema);
export default User;

