import { Subject, SubjectProfile } from "../models/subject.js";
import { Review, Group } from "../models/subjectRelated.js";
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

  if (typeof gradeData === "object") {
    if (!sector) throw new Error("Sector required");
  } else if (!gradeData.includes(name)) {
    throw new Error("Invalid subject");
  }
};

// ====================
// RETRY UTILITY FOR TRANSACTIONS
// ====================
async function runWithRetry(fn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const result = await fn(session);
      await session.commitTransaction();
      return result;
    } catch (err) {
      await session.abortTransaction();
      if (err.codeName === "WriteConflict" && attempt < maxRetries - 1) {
        console.warn(`Write conflict, retrying... (${attempt + 1})`);
        continue;
      }
      throw err;
    } finally {
      session.endSession();
    }
  }
}

// ====================
// SERVICE METHODS
// ====================
export const SubjectService = {
  createSubject: async (data) => {
    return await runWithRetry(async (session) => {
      const requiredFields = ["name", "grade", "education_system", "language"];
      const missingFields = requiredFields.filter((field) => !data[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      validateSubjectData(data);

      const subject = new Subject({
        name: data.name,
        grade: data.grade,
        education_system: data.education_system,
        language: data.language,
        sector: data.sector,
        years_experience: data.years_experience || 0,
      });
      await subject.save({ session });

      if (data.teacherIds && data.teacherIds.length > 0) {
        for (const teacherId of data.teacherIds) {
          const profile = new SubjectProfile({
            subject_id: subject._id,
            teacher_id: teacherId,
            user_type: "tutor",
            rating: 0,
            yearsExp: 0,
            payment_timing: "Postpaid",
            session_duration: 60,
            lectures_per_week: 2,
            payment_methods: ["Cash"],
          });
          await profile.save({ session });

          await Teacher.findByIdAndUpdate(
            teacherId,
            {
              $addToSet: {
                subjects: subject._id,
                subject_profiles: profile._id,
              },
            },
            { session }
          );
        }
      }

      return subject;
    });
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
    return await runWithRetry(async (session) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid subject id");
      }

      const subject = await Subject.findById(id).session(session);
      if (!subject) {
        return null;
      }

      const profiles = await SubjectProfile.find({ subject_id: id }).session(session);
      const profileIds = profiles.map((p) => p._id);

      if (profileIds.length > 0) {
        await Review.deleteMany({ subject_profile: { $in: profileIds } }).session(session);
      }

      await SubjectProfile.deleteMany({ subject_id: id }).session(session);

      // Separate teacher updates to reduce conflicts
      await Teacher.updateMany(
        { subjects: id },
        { $pull: { subjects: id } },
        { session }
      );

      if (profileIds.length > 0) {
        await Teacher.updateMany(
          { subject_profiles: { $in: profileIds } },
          { $pull: { subject_profiles: { $in: profileIds } } },
          { session }
        );
      }

      const deleted = await Subject.findByIdAndDelete(id).session(session);
      return deleted;
    });
  },

  createProfile: async (teacherId, profileData) => {
    return await runWithRetry(async (session) => {
      const teacher = await Teacher.findById(teacherId).session(session);
      if (!teacher.subjects.includes(profileData.subject_id)) {
        throw new Error("Teacher doesn't teach this subject");
      }

      const profile = new SubjectProfile({
        subject_id: profileData.subject_id,
        teacher_id: teacherId,
      });
      await profile.save({ session });

      await Teacher.findByIdAndUpdate(
        teacherId,
        { $push: { subject_profiles: profile._id } },
        { session }
      );

      return profile;
    });
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
  return await runWithRetry(async (session) => {
    const profile = await SubjectProfile.findOne({
      _id: profileId,
      teacher_id: teacherId,
    }).session(session);

    if (!profile) throw new Error("Profile not found or access denied");

    // Handle nested offers without Lodash
    function convertOfferPercentage(obj, path) {
      const keys = path.split('.');
      let current = obj;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) return;
        current = current[keys[i]];
      }
      
      const lastKey = keys[keys.length - 1];
      if (current[lastKey]?.percentage) {
        current[lastKey].percentage = Number(current[lastKey].percentage);
      }
    }

    // Convert percentages for all pricing types
    convertOfferPercentage(updateData, 'group_pricing.offer');
    convertOfferPercentage(updateData, 'private_pricing.offer');
    
    if (updateData.additional_pricing) {
      updateData.additional_pricing = updateData.additional_pricing.map(item => {
        if (item.offer?.percentage) {
          return {
            ...item,
            offer: {
              ...item.offer,
              percentage: Number(item.offer.percentage)
            }
          };
        }
        return item;
      });
    }

      if (updateData.groups) {
        const groupUpdates = updateData.groups.map(async (groupData) => {
          if (groupData._id) {
            return await Group.findByIdAndUpdate(groupData._id, groupData, { new: true, session });
          } else {
            const newGroup = new Group(groupData);
            await newGroup.save({ session });
            return newGroup;
          }
        });
        const updatedGroups = await Promise.all(groupUpdates);
        profile.groups = updatedGroups.map(g => g._id);
        delete updateData.groups;
      }

      Object.assign(profile, updateData);
      await profile.save({ session });
      return profile;
    });
  },

  deleteProfile: async (profileId, teacherId) => {
    return await runWithRetry(async (session) => {
      const profile = await SubjectProfile.findOneAndDelete({
        _id: profileId,
        teacher_id: teacherId,
      }).session(session);

      if (!profile) throw new Error("Profile not found or access denied");

      await Teacher.findByIdAndUpdate(
        teacherId,
        { $pull: { subject_profiles: profileId } },
        { session }
      );
    });
  },

  createReview: async ({ profileId, userId, rating, comment }) => {
    if (rating < 1 || rating > 5) throw new Error("Rating must be 1-5");

    const review = new Review({
      subject_profile: profileId,
      User_ID: userId,
      Rate: rating,
      Comment: comment,
      approved: false,
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

    const reviews = await Review.find({
      subject_profile: review.subject_profile,
      approved: true,
    });

    const avg = reviews.reduce((sum, r) => sum + r.Rate, 0) / reviews.length;
    await SubjectProfile.findByIdAndUpdate(review.subject_profile, {
      rating: avg.toFixed(1),
    });

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
      .select("subjects subject_profiles")
      .populate({
        path: "subjects",
        select: "name grade education_system sector language years_experience",
      })
      .populate({
        path: "subject_profiles",
        populate: [
          {
            path: "subject_id",
            select: "name grade education_system sector years_experience",
          },
          {
            path: "groups",
          },
        ],
      })
      .lean();

    if (!teacher) throw new Error("Teacher not found");

    return {
      baseSubjects: teacher.subjects || [],
      subjectProfiles: teacher.subject_profiles || [],
    };
  },
};
