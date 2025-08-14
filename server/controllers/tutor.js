import { getProfileData } from '../services/authentication.service.js';
import { enrollStudent } from '../services/tutor.service.js';
import { Teacher } from '../models/teacher.js';

export async function getProfile(req, res) {
    try {
        console.log('getProfile called for user:', req.user._id);
        const profileData = getProfileData(req.user);
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

        if (updated_information.social_media && 
            typeof updated_information.social_media === 'object' && 
            !Array.isArray(updated_information.social_media)) {
            updateData.social_media = updated_information.social_media;
        }

        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) delete updateData[key];
        });

        const updatedUser = await Teacher.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (err) {
        console.error('Update error:', err);
        return res.status(400).json({ error: 'Failed to update profile' });
    }
}

export async function getTutor(req, res) {
    try {
        if (!req.teacher) {
            return res.status(400).json({ error: "Teacher data not found" });
        }

        const teacher = await Teacher.findById(req.teacher._id)
            .select('+about_me')
            .lean();

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
        let { pages, limit } = req.params;
        pages = parseInt(pages) || 1;
        limit = parseInt(limit) || 10;
        const skip = (pages - 1) * limit;

        const tutors = await Teacher.find({ role: 'teacher' })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Teacher.countDocuments({ role: 'teacher' });

        return res.status(200).json({
            tutors,
            page: pages,
            limit,
            totalPages: Math.ceil(total / limit),
            totalTutors: total
        });
    } catch (err) {
        console.error("Error in getTutors:", err);
        return res.status(500).json({ error: "Error getting tutors" });
    }
}

export async function acceptEnrollment(req, res) {
    try {
        const { tutorId } = req.body;

        if (!tutorId || tutorId !== req.user._id.toString() || !req.student) {
            return res.status(400).json({ error: "Invalid request" });
        }

        const result = await enrollStudent(req.user, req.student);
        if (result.error) return res.status(400).json(result);
        
        if (req.enrollment) await req.enrollment.delete();

        return res.status(200).json({
            message: "Enrollment accepted successfully"
        });
    } catch (err) {
        return res.status(500).json({ error: "Error accepting enrollment" });
    }
}

export async function rejectEnrollment(req, res) {
    try {
        const { tutorId } = req.body;

        if (!tutorId || tutorId !== req.user._id.toString() || !req.enrollment) {
            return res.status(400).json({ error: "Invalid request" });
        }

        await req.enrollment.delete();
        return res.status(200).json({
            message: "Enrollment request rejected"
        });
    } catch (err) {
        return res.status(500).json({ error: "Error rejecting enrollment" });
    }
}