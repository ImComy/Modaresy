import { Teacher, Enrollment } from '../models/teacher.js';

export async function getTeacherbyId(req, res, next) {
    try {
        const { tutorId } = req.params;
        if (!tutorId) return res.status(400).json({ error: "tutorId is required" });
        
        const teacher = await Teacher.findById(tutorId);
        if (!teacher) return res.status(404).json({ error: "Teacher not found" });
        
        req.teacher = teacher;
        next();
    } catch (err) {
        res.status(500).json({ error: "Error fetching teacher" });
    }
}

export function isTeacher(req, res, next) {
    if (req.user?.type === "Teacher") return next();
    res.status(403).json({ error: "Teacher access required" });
}

export async function getEnrollmentRequest(req, res, next) {
    try {
        const { enrollmentRequestId } = req.body;
        if (!enrollmentRequestId) return res.status(400).json({ error: "Request ID required" });
        
        const request = await Enrollment.findById(enrollmentRequestId);
        if (!request) return res.status(404).json({ error: "Enrollment not found" });
        
        req.enrollment = request;
        next();
    } catch (err) {
        res.status(500).json({ error: "Error fetching enrollment" });
    }
}

export async function enrollStudent(student, teacher) {
    try {
        const enrollment = new Enrollment({
            studentId: student._id,
            tutorId: teacher._id,
            status: 'accepted',
        });

        await enrollment.save();
        await Teacher.findByIdAndUpdate(teacher._id, {
            $push: { enrollments: enrollment._id }
        });

        return { message: "Enrollment successful" };
    } catch (err) {
        return { error: "Error enrolling student" };
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