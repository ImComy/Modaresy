import { getProfileData } from '../services/authentication.service.js';
import { enrollStudent, filterTutors } from '../services/tutor.service.js';
import { Teacher } from '../models/teacher.js';
import { PersonalAvailability } from '../models/misc.js';

export async function getProfile(req, res) {
    try {
        console.log('getProfile called for user:', req.user._id);
        const teacher = await Teacher.findById(req.user._id)
            .populate('availability')
            .select('-password')
            .lean();

        if (!teacher) {
            return res.status(404).json({ error: "Teacher not found" });
        }

        const profileData = getProfileData(teacher);
        profileData.availability = teacher.availability;

        return res.status(200).json({ userdata: profileData });
    } catch (err) {
        console.error('Error in getProfile:', err);
        return res.status(500).json({ error: "Failed to get profile data" });
    }
}


export async function populateAvailability(req, res, next) {
  if (req.teacher) {
    req.teacher = await Teacher.findById(req.teacher._id)
      .populate('availability');
  }
  next();
}

export async function updateProfile(req, res) {
    try {
        console.log('updateProfile called for user:', req.user._id);
        const { updated_information } = req.body;

        if (!updated_information || typeof updated_information !== 'object') {
            return res.status(400).json({ error: 'Invalid update data format' });
        }

        const teacherUpdateData = {
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
        Object.keys(teacherUpdateData).forEach(key => {
            if (teacherUpdateData[key] === undefined) {
                delete teacherUpdateData[key];
            }
        });

        const teacher = await Teacher.findById(req.user._id);
        if (!teacher) {
            return res.status(404).json({ error: 'User not found' });
        }
        Object.assign(teacher, teacherUpdateData);

        if (updated_information.social_media && 
            typeof updated_information.social_media === 'object' && 
            !Array.isArray(updated_information.social_media)) {
            
            const newSocialMap = new Map();
            Object.entries(updated_information.social_media).forEach(([key, value]) => {
                newSocialMap.set(key, value || '');
            });

            teacher.social_media = newSocialMap;
        }

        if (updated_information.availability) {
            const availabilityData = updated_information.availability;
            if (teacher.availability) {
                await PersonalAvailability.findByIdAndUpdate(teacher.availability, {
                    times: availabilityData.times,
                    note: availabilityData.note
                });
            } else {
                const newAvailability = await PersonalAvailability.create({
                    times: availabilityData.times,
                    note: availabilityData.note
                });
                teacher.availability = newAvailability._id;
            }
        }
        
        await teacher.save();

        const updatedUser = await Teacher.findById(req.user._id)
            .populate('availability')
            .select('-password')
            .lean(); 

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
        .populate('availability') 
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

export async function filterTutorsController(req, res) {
  try {
    const filters = {
      educationSystem: req.query.education_system || req.query.educationSystem,
      grade: req.query.grade,
      subject: req.query.subject,
      language: req.query.language,
      sector: req.query.sector,
      governate: req.query.governate,
      district: req.query.district,
      minRating: req.query.min_rating 
        ? parseFloat(req.query.min_rating) 
        : (req.query.minRating ? parseFloat(req.query.minRating) : undefined),
      minPrice: req.query.min_price 
        ? parseFloat(req.query.min_price) 
        : (req.query.minPrice ? parseFloat(req.query.minPrice) : undefined),
      maxPrice: req.query.max_price 
        ? parseFloat(req.query.max_price) 
        : (req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined),
    };

    const filteredTutors = await filterTutors(filters);
    return res.status(200).json({ tutors: filteredTutors });
  } catch (error) {
    console.error("Error in filterTutorsController:", error);
    return res.status(500).json({ error: error.message });
  }
}

export async function recommendTutorsController(req, res) {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const userType = (user.type || '').toLowerCase();
    if (userType !== 'student') return res.status(403).json({ message: 'Only students can get recommendations' });

        const q = req.query.q || '';
        const page = parseInt(req.query.page || '1', 10);
        const limit = parseInt(req.query.limit || '12', 10);

        const { recommendTutorsForStudent } = await import('../services/tutor.service.js');
    const result = await recommendTutorsForStudent(user, { q, page, limit });
    return res.status(200).json({ tutors: result.tutors || result, total: result.total || (Array.isArray(result) ? result.length : 0) });
    } catch (error) {
        console.error('Error in recommendTutorsController:', error);
        return res.status(500).json({ error: error.message });
    }
}