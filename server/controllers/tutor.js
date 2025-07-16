import {
  getProfileData
} from '../services/authentication.service.js'
import {
    Review
} from '../models/subjectRelated.js'

export async function getProfile(req, res){    
    return res.status(200).json({userdata: getProfileData(req.user)})
}

export async function updateProfile(req, res) {
    try {
        const { updated_information } = req.body
        Object.assign(req.user, updated_information);
        await req.user.save()
        return res.status(200).json({ message: "Profile updated" });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

export async function getTutor(req, res) {
    const teacher = await req.teacher.populate('subject_profiles').toObject()
    return res.status(200).json(teacher);
}

export async function getTutors(req, res) {
    try{
        const { pages, limit, Grade, Sector, Language, Governate, District, MinimumRating, MinMonthlyRange, MaxMonthlyRange } = req.params;
        pages = parseInt(pages) || 1;
        limit = parseInt(limit) || 10;
        const NumberOfResults = pages * limit;

        const query = {};
        if (Grade) query['subject_profiles.grade'] = Grade;
        if (Sector) query['subject_profiles.sector'] = Sector;
        if (Language) query['subject_profiles.language'] = Language;
        if (Governate) query['subject_profiles.governate'] = Governate;
        if (District) query['subject_profiles.district'] = District;
        if (MinimumRating) query['subject_profiles.rating'] = { $gte: MinimumRating };
        if (MinMonthlyRange && MaxMonthlyRange) {
            query['subject_profiles.monthly_price'] = { $gte: MinMonthlyRange, $lte: MaxMonthlyRange };
        }

        const tutors = await User.find({ role: 'teacher', ...query })
            .populate('subject_profiles')
            .limit(NumberOfResults)
            .exec();

        return res.status(200).json(tutors);
    }catch(err){
        return res.status(400).json({ error: "Error getting tutors", err });
    }
}

export async function reviewTutor(req, res){
    try{
        const my_review = new Review({
            ...req.body,
            User_ID: req.user._id
        })
        await my_review.save()
        return res.status(200).json(my_review);
    }catch(err){
        return res.status(400).json({ error: "Error reviewing tutor", err });
    }
}