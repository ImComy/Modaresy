import { getProfileData } from '../services/authentication.service.js';
import { Review } from '../models/subjectRelated.js';
import { enrollStudent } from '../services/tutor.service.js';
import { Teacher } from '../models/teacher.js';
import mongoose from 'mongoose';

export async function getProfile(req, res) {
    try {
        console.log('getProfile called for user:', req.user._id);
        const profileData = getProfileData(req.user);
        console.log('Profile data retrieved successfully');
        return res.status(200).json({ userdata: profileData });
    } catch (err) {
        console.error('Error in getProfile:', err);
        return res.status(500).json({ error: "Failed to get profile data" });
    }
}

export async function updateProfile(req, res) {
    try {
        console.log('updateProfile called for user:', req.user._id);
        const { updated_information } = req.body;

        if (!updated_information || typeof updated_information !== 'object') {
            return res.status(400).json({ error: 'Invalid update data' });
        }

        // Prepare update object
        const updateData = {
            name: updated_information.name,
            img: updated_information.img,
            bannerimg: updated_information.bannerimg,
            about_me: updated_information.about_me,
            governate: updated_information.governate,
            district: updated_information.district,
            address: updated_information.address,
            experience_years: updated_information.experience_years,
            rating: updated_information.rating
        };

        // Handle social_media as Map
        if (updated_information.social_media) {
            if (typeof updated_information.social_media === 'object' && 
                !Array.isArray(updated_information.social_media)) {
                // Convert object to Map format
                updateData.social_media = updated_information.social_media;
            } else {
                console.warn('Invalid social_media format - expected object');
                delete updateData.social_media;
            }
        }

        // Handle subject_profiles
        if (Array.isArray(updated_information.subject_profiles)) {
            updateData.subject_profiles = updated_information.subject_profiles
                .filter(sp => sp && mongoose.Types.ObjectId.isValid(sp._id || sp))
                .map(sp => new mongoose.Types.ObjectId(sp._id || sp));
        }

        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        console.log('Prepared update data:', updateData);

        const updatedUser = await Teacher.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { 
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (err) {
        console.error('Update error:', {
            error: err.message,
            stack: err.stack,
            updateData: req.body.updated_information
        });
        return res.status(400).json({
            error: err.message || 'Failed to update profile'
        });
    }
}

export async function getTutor(req, res) {
    try {
        console.log('getTutor called for teacher ID:', req.teacher?._id);

        if (!req.teacher) {
            return res.status(400).json({ error: "Teacher data not found" });
        }

        const teacher = await Teacher.findById(req.teacher._id)
            .select('+about_me')
            .populate('subject_profiles')
            .lean();

        console.log('Full teacher data from DB:', teacher);

        if (!teacher) {
            return res.status(404).json({ error: "Teacher not found" });
        }

        return res.status(200).json(teacher);
    } catch (err) {
        console.error("Error in getTutor:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getTutors(req, res) {
    try {
        let { pages, limit, Grade, Sector, Language, Governate, District, MinimumRating, MinMonthlyRange, MaxMonthlyRange } = req.params;
        pages = parseInt(pages) || 1;
        limit = parseInt(limit) || 10;
        const skip = (pages - 1) * limit;

        const query = { role: 'teacher' };
        const subjectProfileQuery = {};

        if (Grade) subjectProfileQuery['grade'] = Grade;
        if (Sector) subjectProfileQuery['sector'] = Sector;
        if (Language) subjectProfileQuery['language'] = Language;
        if (Governate) subjectProfileQuery['governate'] = Governate;
        if (District) subjectProfileQuery['district'] = District;
        if (MinimumRating) subjectProfileQuery['rating'] = { $gte: parseFloat(MinimumRating) };
        if (MinMonthlyRange && MaxMonthlyRange) {
            subjectProfileQuery['monthly_price'] = {
                $gte: parseFloat(MinMonthlyRange),
                $lte: parseFloat(MaxMonthlyRange)
            };
        }

        if (Object.keys(subjectProfileQuery).length > 0) {
            query['subject_profiles'] = { $elemMatch: subjectProfileQuery };
        }

        const tutors = await Teacher.find(query)
            .populate('subject_profiles')
            .skip(skip)
            .limit(limit)
            .exec();

        const total = await Teacher.countDocuments(query);

        return res.status(200).json({
            tutors,
            page: pages,
            limit,
            totalPages: Math.ceil(total / limit),
            totalTutors: total
        });
    } catch (err) {
        console.error("Error in getTutors:", err);
        return res.status(500).json({ error: "Error getting tutors", details: err.message });
    }
}

export async function reviewTutor(req, res) {
    try {
        const reviewData = {
            ...req.body,
            User_ID: req.user._id,
            approved: false
        };
        const my_review = new Review(reviewData);
        await my_review.save();
        return res.status(200).json(my_review);
    } catch (err) {
        return res.status(400).json({
            error: "Error reviewing tutor",
            details: err.message
        });
    }
}

export async function acceptEnrollment(req, res) {
    try {
        const { tutorId } = req.body;

        if (!tutorId) {
            return res.status(400).json({ error: "tutorId is required" });
        }
        if (tutorId !== req.user._id.toString()) {
            return res.status(403).json({ error: "You are not authorized to accept this enrollment" });
        }
        if (!req.student) {
            return res.status(400).json({ error: "Student data not found" });
        }

        const result = await enrollStudent(req.user, req.student);

        if (result.error) {
            return res.status(400).json(result);
        }

        if (req.enrollment) {
            await req.enrollment.delete();
        }

        return res.status(200).json({
            message: "Enrollment accepted successfully",
            enrollment: result
        });
    } catch (err) {
        return res.status(500).json({
            error: "Error accepting enrollment",
            details: err.message
        });
    }
}

export async function rejectEnrollment(req, res) {
    try {
        const { tutorId } = req.body;

        if (!tutorId) {
            return res.status(400).json({ error: "tutorId is required" });
        }
        if (tutorId !== req.user._id.toString()) {
            return res.status(403).json({ error: "You are not authorized to reject this enrollment" });
        }
        if (!req.enrollment) {
            return res.status(400).json({ error: "Enrollment data not found" });
        }

        await req.enrollment.delete();
        return res.status(200).json({
            message: "Enrollment request rejected successfully"
        });
    } catch (err) {
        return res.status(500).json({
            error: "Error rejecting enrollment",
            details: err.message
        });
    }
}
