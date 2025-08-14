import { Subject, SubjectProfile} from "../models/subject.js";
import { Review } from "../models/subjectRelated.js";
import mongoose from "mongoose";
import { SubjectsBySystem } from "../models/constants.js";
import { Teacher } from "../models/teacher.js";

// ====================
// VALIDATION UTILITIES
// ====================
const validateSubjectData = (data) => {
  const { name, grade, education_system, sector } = data;
  
  if (!SubjectsBySystem[education_system]) {
    throw new Error("Invalid education system");
  }
  
  const gradeData = SubjectsBySystem[education_system][grade];
  if (!gradeData) throw new Error("Invalid grade");
  
  if (typeof gradeData === 'object') {
    if (!sector) throw new Error("Sector required");
  } 
  else if (!gradeData.includes(name)) {
    throw new Error("Invalid subject");
  }
};

// ====================
// SERVICE METHODS
// ====================
const validateRequiredFields = (data, fields) => {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};

export const SubjectService = {
  createSubject: async (data) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Validate required fields
      const requiredFields = ['name', 'grade', 'education_system', 'language'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Validate subject structure
      validateSubjectData(data);

      // 1. Create base subject
      const subject = new Subject({
        name: data.name,
        grade: data.grade,
        education_system: data.education_system,
        language: data.language,
        sector: data.sector,
        years_experience: data.years_experience || 0,
      });
      await subject.save({ session });

      // 2. Create profiles and assign to teachers
      if (data.teacherIds && data.teacherIds.length > 0) {
        for (const teacherId of data.teacherIds) {
          // Create profile with default values
          const profile = new SubjectProfile({
            subject_id: subject._id,
            teacher_id: teacherId,
            user_type: "tutor",
            rating: 0,
            yearsExp: 0,
            payment_timing: "Postpaid",
            session_duration: 60,
            lectures_per_week: 2,
            payment_methods: ['Cash']
          });
          await profile.save({ session });

          // Add to teacher's profiles
          await Teacher.findByIdAndUpdate(
            teacherId,
            { 
              $addToSet: { 
                subjects: subject._id,
                subject_profiles: profile._id 
              } 
            },
            { session }
          );
        }
      }

      await session.commitTransaction();
      return subject;
    } catch (err) {
      await session.abortTransaction();
      throw new Error(`Subject creation failed: ${err.message}`);
    } finally {
      session.endSession();
    }
  },
  
  getSubjectById: async (id) => {
    return await Subject.findById(id);
  },
  
  updateSubject: async (id, updateData) => {
    const existing = await Subject.findById(id);
    validateSubjectData({ ...existing.toObject(), ...updateData });
    return await Subject.findByIdAndUpdate(id, updateData, { 
      new: true, 
    });
  },
  
  deleteSubject: async (id) => {
    const profileCount = await SubjectProfile.countDocuments({ subject_id: id });
    if (profileCount > 0) {
      throw new Error("Subject is used in profiles and cannot be deleted");
    }
    return await Subject.findByIdAndDelete(id);
  },

  // ----- Subject Profiles -----
  createProfile: async (teacherId, profileData) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Verify subject exists and is assigned to teacher
      const teacher = await Teacher.findById(teacherId).session(session);
      if (!teacher.subjects.includes(profileData.subject_id)) {
        throw new Error("Teacher doesn't teach this subject");
      }

      // 2. Create profile
      const profile = new SubjectProfile({
        subject_id: profileData.subject_id,
        teacher_id: teacherId,
        // ... other profile data
      });
      await profile.save({ session });

      // 3. Link to teacher's profiles
      await Teacher.findByIdAndUpdate(
        teacherId,
        { $push: { subject_profiles: profile._id } },
        { session }
      );

      await session.commitTransaction();
      return profile;
    } catch (err) {
      await session.abortTransaction();
      throw new Error(`Profile creation failed: ${err.message}`);
    } finally {
      session.endSession();
    }
  },
  
  getProfileById: async (profileId, teacherId) => {
    const profile = await SubjectProfile.findById(profileId);
    if (!profile) throw new Error("Profile not found");
    if (profile.teacher_id.toString() !== teacherId) {
      throw new Error("Access denied: Not profile owner");
    }
    return profile;
  },
  
  updateProfile: async (profileId, updateData, teacherId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Ownership check
      const profile = await SubjectProfile.findOne({
        _id: profileId,
        teacher_id: teacherId
      }).session(session);
      
      if (!profile) throw new Error("Profile not found or access denied");
      
      // Apply updates
      Object.assign(profile, updateData);
      await profile.save({ session });
      await session.commitTransaction();
      return profile;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  },
  
  deleteProfile: async (profileId, teacherId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Verify ownership
      const profile = await SubjectProfile.findOneAndDelete({
        _id: profileId,
        teacher_id: teacherId
      }).session(session);
      
      if (!profile) throw new Error("Profile not found or access denied");
      
      // Remove from teacher
      await mongoose.model("Teacher").findByIdAndUpdate(
        teacherId,
        { $pull: { subject_profiles: profileId } },
        { session }
      );
      
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  },

  // ----- Reviews -----
  createReview: async ({ profileId, userId, rating, comment }) => {
    if (rating < 1 || rating > 5) throw new Error("Rating must be 1-5");
    
    const review = new Review({
      subject_profile: profileId,
      User_ID: userId,
      Rate: rating,
      Comment: comment,
      approved: false
    });
    
    await review.save();
    return review;
  },
  
  approveReview: async (reviewId) => {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { approved: true },
      { new: true }
    );
    
    if (!review) throw new Error("Review not found");
    
    // Recalculate profile rating
    const reviews = await Review.find({ 
      subject_profile: review.subject_profile,
      approved: true
    });
    
    const avg = reviews.reduce((sum, r) => sum + r.Rate, 0) / reviews.length;
    await SubjectProfile.findByIdAndUpdate(
      review.subject_profile,
      { rating: avg.toFixed(1) }
    );
    
    return review;
  },

  getAllSubjectsPublic: async () => {
    return Subject.find({})
      .select("name grade education_system language sector years_experience")
      .lean();
  },

getSubjectsForTutor: async (tutorId, requesterId) => {
  
  if (!mongoose.Types.ObjectId.isValid(tutorId)) {
    throw new Error("Invalid tutor ID format");
  }

  const teacher = await Teacher.findById(tutorId)
    .select('subjects subject_profiles')
    .populate({
      path: "subjects",
      select: "name grade education_system sector language years_experience"
    })
    .populate({
      path: "subject_profiles",
      populate: {
        path: "subject_id",
        select: "name grade education_system sector years_experience"
      }
    })
    .lean();

  if (!teacher) throw new Error("Teacher not found");

  return {
    baseSubjects: teacher.subjects || [],
    subjectProfiles: teacher.subject_profiles || []
  };
}

};