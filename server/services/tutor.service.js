// Modules

// Models
import {Teacher, EnrollmentRequest, Enrollment} from '../models/teacher.js'
import Review from "../models/subjectRelated.js";
import SubjectProfile from '../models/subject.js';

// Constants

// Functions
export async function getTeacherbyId(req, res, next){
    try{
        const {tutorId} = req.body || req.params;
        if (!tutorId) return res.status(400).json({error:"tutorId is required"})
        if (typeof tutorId !== 'string') return res.status(400).json({error:"tutorId must be a string"})

        const teacher = await Teacher.findById(tutorId);
        if (!teacher) return res.status(404).json({warn:"cannot find teacher"})
        req.teacher = teacher
        next()
    }catch(err){
        return res.status(400).json({message:"error getting the teacher" ,err})
    }
}

export function isTeacher(req, res, next){
    if (req.user && req.user.type == "Teacher"){
        next()
    }else{
        return res.status(400).json({error: "user isn't a teacher"})
    }
}

export async function getSubjectProfileReviews(req, res){
    try {
    const { subjectProfileID } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const reviews = await Review.find({ subject_profile: subjectProfileID })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await Review.countDocuments({ subject_profile: subjectProfileID });

    return res.status(200).json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalReviews: total,
      reviews
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function get_subject_profile(req, res){
  try{
    const { subjectProfileID } = req.params;
    const subject_profile = await SubjectProfile.findById(subjectProfileID);
    if (!subject_profile) return res.status(404).json({warn:"cannot find subject profile"})
    subject_profile.populate('subject_id')
  .populate('private_pricing')
  .populate('offer_id')
  .populate('groups')
  .populate('additional_pricing')
  .populate('youtube');
    
    return res.status(200).json(subject_profile);
  }catch(err){
      return res.status(400).json({error:"error getting subject profile", err})
  }
}

export async function get_subject_profiles(req, res){
    try{
        const teacher = await req.teacher.populate({
            path: 'subject_profiles',
            populate: [
              { path: 'subject_id' },
              { path: 'private_pricing' },
              { path: 'offer_id' },
              { path: 'groups' },
              { path: 'additional_pricing' },
              { path: 'youtube' },
            ]
          }).toObject()

        
        return res.status(200).json(teacher.subject_profiles)
    }catch(err){
        return res.status(400).json({error:"error getting subject profiles", err})
    }
}

export async function getEnrollmentRequest(req, res, next){
    try{
        const { enrollmentRequestId } = req.body;
        if (!enrollmentRequestId) return res.status(400).json({error:"enrollmentRequestId is required"})
        
        const EnrollmentRequest = await EnrollmentRequest.findById(enrollmentRequestId);
        if (!EnrollmentRequest) return res.status(404).json({warn:"cannot find enrollment request"})
        
        req.EnrollmentRequest = EnrollmentRequest;
        next();
    }catch(err){
        return res.status(400).json({message:"error getting the enrollment request" ,err})
    }
}

export async function enrollStudent(student, teacher) {
    try{
      const my_enrollment = new Enrollment({
        studentId: student._id,
        tutorId: teacher._id,
        status: 'accepted',
      });
      teacher.enrollments.push(my_enrollment._id);
      await my_enrollment.save();
      await teacher.save();
      return {message: "enrollment successful"}
    }catch(err){
        return {error:"error enrolling student", err}
    }
}
