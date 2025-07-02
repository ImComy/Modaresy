import mongoose, { mongo, Schema } from 'mongoose';
import { Grades, Languages, Sectors} from './constants.js';

const SubjectSchema = new Schema({
    name: {type: String, required: true},
    grade: {type: String, required: true, enum: Grades},
    sector: {type: String, required: true, enum: Sectors},
    language: {type: String, required: true, enum: Languages}
})

const SubjectProfileSchema = new Schema({
    subject_id: {type: mongoose.Types.ObjectId, required: true},
    rating: {type: mongoose.Types.Double, required: true},
    description: {type: String, required: true},
    group_pricing: {type: Number, required: true},
    price_period: {type: Number, required: true},
    private_pricing: {type: Number, required: true},
    offer_id: {type: mongoose.Types.ObjectId},
    payment_methods: {type: [String]},
    groups: {type: [mongoose.Types.ObjectId]},
    session_duration: {type: mongoose.Types.Double, required: true},
    lectures_per_week: {type: Number, required: true},
    reviews: {type: [mongoose.Types.ObjectId]},
    additonal_pricing: {type: mongoose.Types.ObjectId},
    youtube_links: {type: [String]}
})

export const Subject = mongoose.model("Subject", SubjectSchema);
export const SubjectProfile = mongoose.model("SubjectProfile", SubjectProfileSchema);