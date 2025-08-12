// Modules

// Models
import { Teacher, Enrollment } from '../models/teacher.js';
import { Review } from "../models/subjectRelated.js";
import { SubjectProfile } from '../models/subject.js';

// Constants

// Functions
export async function getTeacherbyId(req, res, next) {
    try {
        console.log('getTeacherbyId called');
        const { tutorId } = req.body || req.params;
        console.log(`Received tutorId: ${tutorId}`);
        
        if (!tutorId) {
            console.log('Error: tutorId is required');
            return res.status(400).json({ error: "tutorId is required" });
        }
        if (typeof tutorId !== 'string') {
            console.log('Error: tutorId must be a string');
            return res.status(400).json({ error: "tutorId must be a string" });
        }

        const teacher = await Teacher.findById(tutorId);
        console.log(`Teacher found: ${teacher ? teacher._id : 'Not found'}`);
        
        if (!teacher) {
            console.log('Warning: Cannot find teacher');
            return res.status(404).json({ warn: "cannot find teacher" });
        }
        
        req.teacher = teacher;
        next();
    } catch (err) {
        console.error('Error in getTeacherbyId:', err);
        return res.status(400).json({ message: "error getting the teacher", err });
    }
}

export function isTeacher(req, res, next) {
    console.log('isTeacher middleware called');
    if (req.user && req.user.type === "Teacher") {
        console.log('User is a teacher');
        next();
    } else {
        console.log('Error: User is not a teacher');
        return res.status(403).json({ error: "user isn't a teacher" });
    }
}

export async function getSubjectProfileReviews(req, res) {
    try {
        console.log('getSubjectProfileReviews called');
        const { subjectProfileID } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        console.log(`Fetching reviews for subjectProfileID: ${subjectProfileID}, page: ${page}, limit: ${limit}`);

        const reviews = await Review.find({ subject_profile: subjectProfileID, approved: true })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Review.countDocuments({ subject_profile: subjectProfileID });

        console.log(`Found ${reviews.length} reviews out of ${total} total`);

        return res.status(200).json({
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalReviews: total,
            reviews
        });
    } catch (err) {
        console.error('Error in getSubjectProfileReviews:', err);
        return res.status(500).json({ error: err.message });
    }
}

export async function get_subject_profile(req, res) {
    try {
        console.log('get_subject_profile called');
        const { subjectProfileID } = req.params;
        console.log(`Fetching subject profile: ${subjectProfileID}`);

        const subject_profile = await SubjectProfile.findById(subjectProfileID);
        if (!subject_profile) {
            console.log('Warning: Cannot find subject profile');
            return res.status(404).json({ warn: "cannot find subject profile" });
        }

        await subject_profile.populate('subject_id')
            .populate('private_pricing')
            .populate('offer_id')
            .populate('groups')
            .populate('additional_pricing')
            .populate('youtube')
            .execPopulate();

        console.log('Successfully fetched subject profile');
        return res.status(200).json(subject_profile);
    } catch (err) {
        console.error('Error in get_subject_profile:', err);
        return res.status(400).json({ error: "error getting subject profile", err });
    }
}

export async function get_subject_profiles(req, res) {
    try {
        console.log('get_subject_profiles called');
        
        if (!req.teacher) {
            console.log('Error: Teacher not found in request');
            return res.status(400).json({ error: "Teacher not found in request" });
        }

        // First get the teacher with basic subject_profiles population
        const teacher = await Teacher.findById(req.teacher._id)
            .populate('subject_profiles')
            .lean();

        if (!teacher) {
            console.log('Error: Teacher not found in database');
            return res.status(404).json({ error: "Teacher not found" });
        }

        console.log(`Found teacher with ${teacher.subject_profiles?.length || 0} subject profiles`);

        if (!teacher.subject_profiles || teacher.subject_profiles.length === 0) {
            return res.status(200).json([]);
        }

        // Now populate each subject_profile with its relations
        const populatedProfiles = await SubjectProfile.find({
            _id: { $in: teacher.subject_profiles.map(p => p._id) }
        })
        .populate('subject_id')
        .populate('private_pricing')
        .populate('offer_id')
        .populate({
            path: 'groups',
            model: 'Group'
        })
        .populate('additional_pricing')
        .populate({
            path: 'youtube',
            model: 'YouTubeLink'
        })
        .lean();

        return res.status(200).json(populatedProfiles);
    } catch (err) {
        console.error('Error in get_subject_profiles:', err);
        return res.status(500).json({ 
            error: "Error getting subject profiles", 
            details: err.message 
        });
    }
}

export async function getEnrollmentRequest(req, res, next) {
    try {
        console.log('getEnrollmentRequest called');
        const { enrollmentRequestId } = req.body;
        console.log(`Enrollment request ID: ${enrollmentRequestId}`);
        
        if (!enrollmentRequestId) {
            console.log('Error: enrollmentRequestId is required');
            return res.status(400).json({ error: "enrollmentRequestId is required" });
        }

        const enrollmentRequest = await Enrollment.findById(enrollmentRequestId);
        console.log(`Enrollment request found: ${enrollmentRequest ? enrollmentRequest._id : 'Not found'}`);
        
        if (!enrollmentRequest) {
            console.log('Warning: Cannot find enrollment request');
            return res.status(404).json({ warn: "cannot find enrollment request" });
        }

        req.EnrollmentRequest = enrollmentRequest;
        next();
    } catch (err) {
        console.error('Error in getEnrollmentRequest:', err);
        return res.status(400).json({ message: "error getting the enrollment request", err });
    }
}

export async function enrollStudent(student, teacher) {
    try {
        console.log('enrollStudent called');
        console.log(`Enrolling student ${student._id} with teacher ${teacher._id}`);

        const my_enrollment = new Enrollment({
            studentId: student._id,
            tutorId: teacher._id,
            status: 'accepted',
        });

        teacher.enrollments.push(my_enrollment._id);
        await my_enrollment.save();
        await teacher.save();

        console.log('Enrollment successful');
        return { message: "enrollment successful" };
    } catch (err) {
        console.error('Error in enrollStudent:', err);
        return { error: "error enrolling student", err };
    }
}

export async function createNewTutor(req, res) {
    try {
        console.log('createNewTutor called');
        const { 
            name,
            email,
            password,
            address,
            about_me,
            experience_years,
            education_system,
            sectors,
            languages,
            grades
        } = req.body;

        console.log('Received tutor data:', { name, email, address });

        const requiredFields = ['name', 'email', 'password', 'address', 'about_me', 'experience_years', 
                              'education_system', 'sectors', 'languages', 'grades'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            console.log(`Missing required fields: ${missingFields.join(', ')}`);
            return res.status(400).json({ error: "All fields are required", missingFields });
        }

        const existingTutor = await Teacher.findOne({ email });
        if (existingTutor) {
            console.log('Error: Email already exists');
            return res.status(400).json({ error: "Email already exists" });
        }

        const newTutor = new Teacher({
            name,
            email,
            password,
            address,
            about_me,
            experience_years,
            education_system,
            sectors,
            languages,
            grades
        });

        await newTutor.save();
        console.log(`New tutor created with ID: ${newTutor._id}`);
        return res.status(201).json({ message: "Tutor created successfully", tutor: newTutor });
    } catch (err) {
        console.error('Error in createNewTutor:', err);
        return res.status(500).json({ error: "Internal server error: " + err.message });
    }
}