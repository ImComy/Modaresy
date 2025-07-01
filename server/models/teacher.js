import { Schema } from 'mongoose';
import validator from 'validator';
const { isMobilePhone } = validator

const TeacherSchema = new Schema({
    about_me: { required: true, type: String },
    subject_profiles: { type: [Schema.Types.ObjectId] },
    experience_years: { type: Number },
    grades: {
        type: [String],
        enum: Grades,
        required: [true, "Choose At least one grade to teach"]
    },
    languages: {
        type: [String],
        enum: Languages,
        required: [true, "Please choose at least one langauge"]
    },
    sectors: {
        type: [{
            type: String,
            validate: {
                validator: function (value) {
                    return Sector_Validation(value, this.grades)
                },
                message: "The sector you chose doesn't match with your grade!"
            }
        }],
        required: [true, "Please choose at least one sector"]
    },
    phone_numbers: {
        type: [String],
        required: true,
        validate: {
            validator: function (phones) {
                return phones.every(phone => isMobilePhone(phone, 'ar-EG'));
            },
            message: "One or more phone numbers are invalid"
        }
    }
})

export const Teacher = User.discriminator("Teacher", TeacherSchema)