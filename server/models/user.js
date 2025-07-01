import mongoose, { Schema } from 'mongoose';
import validator from 'validator';
import { User_Types, Governates } from './constants.js';

const { isEmail, isMobilePhone } = validator;

export const options = { discriminatorKey: 'type', collection: 'Users' };

const UserSchema = new Schema({
    name: { type: String, trim: true, required: [true, "The Username is missing!"] },
    type: { type: String, enum: User_Types, required: [true, "UserType isn't specified!"] },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
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
            message: "The Phone number is invalid!"
        }
    },
    last_login: { type: Date, default: null },
    password: { type: String, required: [true, "Password is missing!"] },
    governate: { type: String, enum: Governates, required: [true, "Please select your governate"] },
    district: {
        type: String,
        required: true,
        /*validate: {
            validator: function (district) {
                const governate = this.governate;
                return Districts[governate]?.includes(district);
            },
            message: props => `District ${props.value} is invalid or doesn't match with the governate`
        }*/
    },
    verified: { type: Boolean, default: false },
    verificationCode: { type: String },
    codeExpiresAt: { type: Date }
}, { ...options, timestamps: true });

export const User = mongoose.model("User", UserSchema);
