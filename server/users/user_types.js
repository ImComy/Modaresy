import mongoose, { Schema } from 'mongoose';
import validator_pkg from 'validator'
const { isEmail, isMobilePhone } = validator_pkg

const User_Types = ["Teacher", "Student"]
const Grades = ["Secondary_1", "Secondary_2", "Secondary_3"]
const Sectors = {
    Secondary_1: ["General"],
    Secondary_2: ["Scientific", "Literature"],
    Secondary_3: ["Mathmatics", "Sciences"]
}
const Languages = ["Arabic", "English", "General"]
const Governates = ["Ismailia"]
/*const Districts = {
    Ismailia: ["Elsheikh zayed", "Ard AlGamiaat", "Alkhamsa"]
}*/

function Sector_Validation(sector, grades) {
    for (let j = 0; j < grades.length; j++) {
        const cur_grade = grades[j];
        const cur_sector = sector;

        if (Sectors[cur_grade] && Sectors[cur_grade].includes(cur_sector)) {
            return true;
        }
    }
    return false;
}

export const options = { discriminatorKey: 'type', collection: 'Users' };

const UserSchema = new Schema({
    name: { type: String , trim: true, required: [true, "The Username is missing!"] },
    type: { type: String, enum: User_Types, required: [true, "UserType isn't specified!"] },
    email: {
        type: String,
        required: true,
        unique: true,
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
            message: "The Phone number is invalid!"
        }
    },
    last_login: {
        type: Date,
        default: null
    },
    password: { type: String, required: [true, "Password is missing!"] },
    governate: { type: String, enum: Governates, required: [true, "Please select your governate"] },
    district: {
        type: String,
        required: true
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
}, options);

const StudentSchema = new Schema({
    language: { type: String, required: [true, "Studying language isn't specified"], enum: Languages },
    grade: { type: String, required: [true, "Student's Grade isn't specified"], enum: Grades },
    sector: {
        type: String,
        required: [true, "Student's Sector isn't specified"],
        validate: {
            validator: function (value) {
                return Sector_Validation(value, [this.grade]);
            },
            message: "Sector doesn't match the student's grade"
        }
    },
    wishlist_id: { type: Schema.Types.ObjectId, required: true, unique: true }
})

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

/////

export const User = mongoose.model("User", UserSchema)
export const Student = User.discriminator("Student", StudentSchema)
export const Teacher = User.discriminator("Teacher", TeacherSchema)
