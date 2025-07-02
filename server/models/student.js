import { Schema } from 'mongoose';
import { Grades, Languages } from './constants.js';
//import { Sector_Validation } from '../utils/constantsValidation.js';
import { User } from './user.js';

const StudentSchema = new Schema({
    language: { type: String, required: [true, "Studying language isn't specified"], enum: Languages },
    grade: { type: String, required: [true, "Student's Grade isn't specified"], enum: Grades },
    sector: {
        type: String,
        required: [true, "Student's Sector isn't specified"],
        validate: {
            validator: function (value) {
                //return Sector_Validation(value, [this.grade]);
            },
            message: "Sector doesn't match the student's grade"
        }
    },
    wishlist_id: { type: Schema.Types.ObjectId, required: true, unique: true }
}, { timestamps: true });

export const Student = User.discriminator("Student", StudentSchema);