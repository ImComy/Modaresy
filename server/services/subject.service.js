import { Subject, SubjectProfile } from "../models/subject.js";
import { Review, Group } from "../models/subjectRelated.js";
import mongoose from "mongoose";
import { Teacher } from "../models/teacher.js";
import Student from "../models/student.js";
import { calculateTeacherRating, calculateProfileRating, updateRatingsForProfile } from '../events/subject_profile.js'
import {
  SubjectsBySystem,
  Languages,
  Language_Independent_Subjects,
  SubjectGroupsToSectorsMap,
  EducationStructure
} from "../models/constants.js";

// ====================
// HELPERS
// ====================
const normalizeArray = (arr) => {
  if (!arr) return [];
  if (!Array.isArray(arr)) arr = [arr];
  // remove falsy, trim, unique, sort
  const set = Array.from(new Set(arr.filter(Boolean).map(v => String(v).trim())));
  set.sort((a, b) => a.localeCompare(b));
  return set;
};

const arraysEqualAsSets = (a, b) => {
  a = normalizeArray(a || []);
  b = normalizeArray(b || []);
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

const findMapSectorsForSubject = (subjectName) => {
  // SubjectGroupsToSectorsMap keys are arrays of subjects -> iterate entries
  for (const [subjectsArr, sectors] of SubjectGroupsToSectorsMap.entries()) {
    if (subjectsArr && Array.isArray(subjectsArr) && subjectsArr.map(s => s.toLowerCase()).includes(subjectName.toLowerCase())) {
      return normalizeArray(sectors);
    }
  }
  return null;
};

const getGradeDefinedSectors = (education_system, grade) => {
  // Look up in EducationStructure to get the grade's sectors (if defined)
  try {
    const system = EducationStructure[education_system];
    if (!system) return [];
    const sectors = system.sectors?.[grade];
    return Array.isArray(sectors) ? normalizeArray(sectors) : [];
  } catch (err) {
    return [];
  }
};

const isValidSubjectForGrade = (name, grade, education_system) => {
  // Accept subject if:
  // - grade entry is an array and contains the name
  // - grade entry is an object (per-sector lists) and any sector's array contains the name
  // - OR subject exists inside any SubjectGroupsToSectorsMap key array (multi-sector items)
  // - OR subject is in Language_Independent_Subjects or Sector_Independent_Subjects or Languages
  const system = SubjectsBySystem[education_system];
  if (!system) return false;
  const gradeData = system[grade];
  if (!gradeData) return false;

  // If gradeData is an array:
  if (Array.isArray(gradeData)) {
    if (gradeData.map(s => s.toLowerCase()).includes(name.toLowerCase())) return true;
  } else if (typeof gradeData === "object") {
    // when gradeData is an object (sectors -> lists)
    for (const key of Object.keys(gradeData)) {
      const arr = gradeData[key];
      if (Array.isArray(arr) && arr.map(s => s.toLowerCase()).includes(name.toLowerCase())) return true;
    }
  }

  // check the SubjectGroupsToSectorsMap
  const mapHit = findMapSectorsForSubject(name);
  if (mapHit) return true;

  // check special lists
  if (Language_Independent_Subjects && Language_Independent_Subjects.map(s => s.toLowerCase()).includes(name.toLowerCase())) return true;
  if (Languages && Languages.map(s => s.toLowerCase()).includes(name.toLowerCase())) return true;

  return false;
};

// ====================
// RETRY UTILITY FOR TRANSACTIONS
// ====================
async function runWithRetry(fn, maxRetries = 18) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const result = await fn(session);
      await session.commitTransaction();
      return result;
    } catch (err) {
      await session.abortTransaction();

      // Detect transient retryable errors. Different drivers/versions may expose labels
      // as `errorLabels` (array) or `errorLabelSet` (Set). Also check for WriteConflict code/name.
      const hasTransientLabel = (err && (
        (Array.isArray(err.errorLabels) && err.errorLabels.includes('TransientTransactionError')) ||
        (err.errorLabelSet && ((err.errorLabelSet instanceof Set && Array.from(err.errorLabelSet).includes('TransientTransactionError')) || (Array.isArray(err.errorLabelSet) && err.errorLabelSet.includes('TransientTransactionError'))))
      ));

      const isWriteConflict = err && (err.codeName === "WriteConflict" || (err.code && String(err.code).toLowerCase().includes('writeconflict')));

      const shouldRetry = (hasTransientLabel || isWriteConflict);

      if (shouldRetry && attempt < maxRetries - 1) {
        const backoffMs = Math.min(150 * Math.pow(2, attempt), 2000); // 150ms, 300ms, 600ms, ... cap 2000ms
        console.warn(`Transient transaction/write conflict detected (labels=${JSON.stringify(err && err.errorLabels)} codeName=${err && err.codeName}), retrying after ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`);
        // small delay before retrying
        await new Promise(res => setTimeout(res, backoffMs));
        continue;
      }

      throw err;
    } finally {
      session.endSession();
    }
  }
}

// ====================
// CONFLICT CHECK
// ====================
// Tutors cannot have two exact subjects with same name, grade, education_system, sectors set and languages set.
async function teacherHasConflictingProfile({ teacherId, subjectName, grade, education_system, sectors = [], languages = [], subjectId = null, session }) {
  const profiles = await SubjectProfile.find({ teacher_id: teacherId })
    .populate({
      path: "subject_id",
      select: "name grade education_system sector language",
    })
    .session(session);

  const targetSectors = normalizeArray(sectors);
  const targetLanguages = normalizeArray(languages);

  // conflict if an existing subject doc has same name, grade, education_system, and identical sector & language sets
  return profiles.some(p => {
    const s = p.subject_id;
    if (!s) return false;
    if (subjectId && s._id && s._id.toString() === subjectId.toString()) {
      // If comparing against the same subject doc, it's not a conflict (used in update/create when re-using same doc)
      return false;
    }
    if (
      s.name.toLowerCase() === String(subjectName).toLowerCase() &&
      s.grade === grade &&
      s.education_system === education_system &&
      arraysEqualAsSets(s.sector || [], targetSectors) &&
      arraysEqualAsSets(s.language || [], targetLanguages)
    ) {
      return true;
    }
    return false;
  });
}

// ====================
// VALIDATION UTILITIES (adapted for arrays and map auto-assignment)
// ====================
const validateSubjectData = (data) => {
  const { name, grade, education_system } = data;

  if (!SubjectsBySystem[education_system]) {
    const e = new Error("Invalid education system");
    e.status = 400;
    throw e;
  }

  const gradeData = SubjectsBySystem[education_system][grade];
  if (!gradeData) {
    const e = new Error("Invalid grade");
    e.status = 400;
    throw e;
  }

  // Validate that the subject name is allowed for that grade (or in multi-sector map or special lists)
  if (!isValidSubjectForGrade(name, grade, education_system)) {
    const e = new Error("Invalid subject for this grade/education system");
    e.status = 400;
    throw e;
  }
};

// ====================
// SERVICE METHODS
// ====================
export const SubjectService = {
createSubject: async (data) => {
  try {
    return await runWithRetry(async (session) => {
      // transactional path (existing implementation)
    // required: name, grade, education_system
    const requiredFields = ["name", "grade", "education_system"];
    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
      const e = new Error(`Missing required fields: ${missingFields.join(", ")}`);
      e.status = 400;
      throw e;
    }

    const { name, grade, education_system } = data;

    // ---------- auto-assign logic (NO FORCE) ----------
    // find mapped sectors (if this subject is part of a map-group)
    const mappedSectors = findMapSectorsForSubject(name); // may be null or [].

    // is this a language subject?
    const isLanguageSubject = Languages.map(s => s.toLowerCase()).includes(String(name).toLowerCase());

    // === Respect client-provided values first ===
    let finalSectors = normalizeArray(data.sector || []);     // use what client sent (if any)
    let finalLanguages = normalizeArray(data.language || []); // use what client sent (if any)

    // If client DIDN'T provide sectors, fallback to mappedSectors (if any).
    if ((finalSectors.length === 0) && mappedSectors && mappedSectors.length > 0) {
      finalSectors = normalizeArray(mappedSectors);
    }

    // If client DIDN'T provide languages and subject is a language subject, fallback to [name, 'English']
    if (finalLanguages.length === 0 && isLanguageSubject) {
      finalLanguages = normalizeArray([name, "English"]);
    }

    // If client DIDN'T provide languages and it's not a language subject, fallback to data.language or remain empty.
    // (We do NOT force other defaults here — only the above fallbacks are applied.)

    // If grade requires sectors (per SubjectsBySystem data), ensure we have at least one sector (either provided or fallback)
    const gradeData = SubjectsBySystem[education_system][grade];
    const gradeRequiresSector = typeof gradeData === "object" && !Array.isArray(gradeData);

    if (gradeRequiresSector && (!finalSectors || finalSectors.length === 0)) {
      const e = new Error("Sector is required for this grade unless the subject auto-assigns sectors (map item or language subject) or the client supplies sectors");
      e.status = 400;
      throw e;
    }

    // language is required by schema — ensure we have at least one language (either client-provided or fallback)
    if (!finalLanguages || finalLanguages.length === 0) {
      const e = new Error("Language is required");
      e.status = 400;
      throw e;
    }

    // Normalize arrays (unique + sorted)
    finalSectors = normalizeArray(finalSectors);
    finalLanguages = normalizeArray(finalLanguages);

    // Validate subject name & grade (keeps existing validation behavior)
    validateSubjectData({ name, grade, education_system });

    // Try to find existing subject document with exact same canonical data
    let subject = await Subject.findOne({
      name,
      grade,
      education_system,
      sector: finalSectors,
      language: finalLanguages
    }).session(session);

    // rest of your logic (reuse subject or create new) remains the same...
    if (subject) {
      if (!data.teacherIds || data.teacherIds.length === 0) {
        const e = new Error("Subject already exists");
        e.status = 409;
        throw e;
      }

      // For each teacher, check conflicts against existing profiles (exact-match rule)
      for (const teacherId of data.teacherIds) {
        const teacher = await Teacher.findById(teacherId).session(session);
        if (!teacher) {
          const e = new Error(`Teacher ${teacherId} not found`);
          e.status = 404;
          throw e;
        }

        const conflict = await teacherHasConflictingProfile({
          teacherId,
          subjectName: name,
          grade,
          education_system,
          sectors: finalSectors,
          languages: finalLanguages,
          subjectId: subject._id,
          session
        });

        if (conflict) {
          const e = new Error(`Teacher ${teacherId} already has a conflicting profile for this subject`);
          e.status = 409;
          throw e;
        }
      }
    } else {
      // Create new subject doc using the client-or-fallback values (no server-forced overwrites)
      subject = new Subject({
        name,
        grade,
        education_system,
        language: finalLanguages,
        sector: finalSectors,
        years_experience: data.years_experience || 0,
      });
      await subject.save({ session });
    }

    // rest of the subject-profile creation logic remains unchanged...
    if (data.teacherIds && data.teacherIds.length > 0) {
      for (const teacherId of data.teacherIds) {
        const teacher = await Teacher.findById(teacherId).session(session);
        if (!teacher) {
          const e = new Error(`Teacher ${teacherId} not found`);
          e.status = 404;
          throw e;
        }

        const existingProfile = await SubjectProfile.findOne({
          subject_id: subject._id,
          teacher_id: teacherId,
        }).session(session);

        if (existingProfile) {
          const e = new Error("Profile already exists for this teacher and subject");
          e.status = 409;
          throw e;
        }

        const conflict = await teacherHasConflictingProfile({
          teacherId,
          subjectName: name,
          grade,
          education_system,
          sectors: finalSectors,
          languages: finalLanguages,
          subjectId: subject._id,
          session
        });

        if (conflict) {
          const e = new Error("Profile would conflict with existing profile rules (language/sector/grade/system)");
          e.status = 409;
          throw e;
        }

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
  } catch (err) {
    // If the transaction failed due to transient errors after retries, attempt a non-transactional fallback
    const isTransient = (err && (
      (Array.isArray(err.errorLabels) && err.errorLabels.includes('TransientTransactionError')) ||
      (err.errorLabelSet && ((err.errorLabelSet instanceof Set && Array.from(err.errorLabelSet).includes('TransientTransactionError')) || (Array.isArray(err.errorLabelSet) && err.errorLabelSet.includes('TransientTransactionError')))) ||
      (err.codeName === 'WriteConflict') || (err.code && String(err.code).toLowerCase().includes('writeconflict'))
    ));

    if (!isTransient) throw err;

    console.warn('[createSubject] Transactional create failed with transient error after retries - trying non-transactional fallback', { message: err.message, errorLabels: err.errorLabels, codeName: err.codeName });

    // NON-TRANSACTIONAL FALLBACK (idempotent-ish):
    // 1) Try to find-or-create the subject doc with a single upsert
    // 2) For each teacher, ensure SubjectProfile exists and push references using atomic ops
    const { name, grade, education_system } = data;

    // Apply same normalization logic as transactional path
    const mappedSectors = findMapSectorsForSubject(name);
    const isLanguageSubject = Languages.map(s => s.toLowerCase()).includes(String(name).toLowerCase());
    let finalSectors = normalizeArray(data.sector || []);
    let finalLanguages = normalizeArray(data.language || []);
    if ((finalSectors.length === 0) && mappedSectors && mappedSectors.length > 0) finalSectors = normalizeArray(mappedSectors);
    if (finalLanguages.length === 0 && isLanguageSubject) finalLanguages = normalizeArray([name, 'English']);
    finalSectors = normalizeArray(finalSectors);
    finalLanguages = normalizeArray(finalLanguages);

    // Upsert subject doc (match exact canonical fields)
    const subjectQuery = { name, grade, education_system, sector: finalSectors, language: finalLanguages };
    const subjectUpdate = { $setOnInsert: { name, grade, education_system, sector: finalSectors, language: finalLanguages, years_experience: data.years_experience || 0 } };

    const subjectDoc = await Subject.findOneAndUpdate(subjectQuery, subjectUpdate, { new: true, upsert: true });

    // If teacherIds supplied, ensure profiles & teacher refs
    if (data.teacherIds && data.teacherIds.length > 0) {
      for (const teacherId of data.teacherIds) {
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
          const e = new Error(`Teacher ${teacherId} not found`);
          e.status = 404;
          throw e;
        }

        // Check duplicate profile (non-transactional)
        let existingProfile = await SubjectProfile.findOne({ subject_id: subjectDoc._id, teacher_id: teacherId });
        if (!existingProfile) {
          // Try create new profile; tolerate duplicate key errors
          try {
            existingProfile = await SubjectProfile.create({ subject_id: subjectDoc._id, teacher_id: teacherId, user_type: 'tutor', rating: 0 });
          } catch (createErr) {
            // If another process created it concurrently, fetch it
            existingProfile = await SubjectProfile.findOne({ subject_id: subjectDoc._id, teacher_id: teacherId });
            if (!existingProfile) throw createErr;
          }
        }

        // Ensure teacher doc references are set atomically
        await Teacher.findByIdAndUpdate(teacherId, { $addToSet: { subjects: subjectDoc._id, subject_profiles: existingProfile._id } });
      }
    }

    return subjectDoc;
  }
},


  getSubjectById: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const e = new Error('Invalid subject id');
      e.status = 400;
      throw e;
    }
    const subject = await Subject.findById(id);
    if (!subject) {
      const e = new Error('Subject not found');
      e.status = 404;
      throw e;
    }
    return subject;
  },

  updateSubject: async (id, updateData) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const e = new Error('Invalid subject id');
      e.status = 400;
      throw e;
    }

    const existing = await Subject.findById(id);
    if (!existing) return null;

    // If update changes name/grade/education_system/language/sector, we must validate and normalize
    const merged = { ...existing.toObject(), ...updateData };

    // Normalize provided arrays if any
    if (merged.language) merged.language = normalizeArray(merged.language);
    if (merged.sector) merged.sector = normalizeArray(merged.sector);

    validateSubjectData(merged);

    // Prevent creating two subject docs that are identical to another existing one
    const conflictSubject = await Subject.findOne({
      _id: { $ne: id },
      name: merged.name,
      grade: merged.grade,
      education_system: merged.education_system,
      sector: merged.sector || [],
      language: merged.language || []
    });

    if (conflictSubject) {
      const e = new Error("Another subject with the exact same fields already exists");
      e.status = 409;
      throw e;
    }

    // perform update
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
      if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
        const e = new Error('Invalid or missing teacher id');
        e.status = 400;
        throw e;
      }

      const teacher = await Teacher.findById(teacherId).session(session);
      if (!teacher) {
        const e = new Error("Teacher not found");
        e.status = 404;
        throw e;
      }

      if (!profileData.subject_id || !mongoose.Types.ObjectId.isValid(profileData.subject_id)) {
        const e = new Error('Invalid or missing subject_id');
        e.status = 400;
        throw e;
      }

      const teaches = (teacher.subjects || []).some(sid => sid && sid.toString() === profileData.subject_id.toString());
      if (!teaches) {
        const e = new Error("Teacher doesn't teach this subject");
        e.status = 400;
        throw e;
      }

      const targetSubject = await Subject.findById(profileData.subject_id).session(session);
      if (!targetSubject) {
        const e = new Error("Subject not found");
        e.status = 404;
        throw e;
      }

      // exact-match conflict check (name/grade/education_system/sectors/language)
      const subjectName = targetSubject.name;
      const grade = targetSubject.grade;
      const education_system = targetSubject.education_system;
      const sectors = targetSubject.sector || [];
      const languages = targetSubject.language || [];

      const conflict = await teacherHasConflictingProfile({
        teacherId,
        subjectName,
        grade,
        education_system,
        sectors,
        languages,
        subjectId: profileData.subject_id,
        session
      });

      if (conflict) {
        const e = new Error("Teacher already has a conflicting profile per subject rules");
        e.status = 409;
        throw e;
      }

      // Prevent exact duplicate profile for same subject doc
      const already = await SubjectProfile.findOne({
        subject_id: profileData.subject_id,
        teacher_id: teacherId,
      }).session(session);

      if (already) {
        const e = new Error("Profile already exists for this teacher and subject");
        e.status = 409;
        throw e;
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
    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      const e = new Error('Invalid profile id');
      e.status = 400;
      throw e;
    }

    const profile = await SubjectProfile.findById(profileId);
    if (!profile) {
      const e = new Error("Profile not found");
      e.status = 404;
      throw e;
    }

    if (teacherId && profile.teacher_id.toString() !== teacherId.toString()) {
      const e = new Error("Access denied: Not profile owner");
      e.status = 403;
      throw e;
    }

    return profile;
  },

  updateProfile: async (profileId, updateData, teacherId) => {
    return await runWithRetry(async (session) => {
      let profile;

      if (teacherId) {
        profile = await SubjectProfile.findOne({
          _id: profileId,
          teacher_id: teacherId,
        }).session(session);
      } else {
        profile = await SubjectProfile.findById(profileId).session(session);
      }

      if (!profile) {
        const e = new Error("Profile not found or access denied");
        e.status = 404;
        throw e;
      }

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
      let profile;

      if (teacherId) {
        profile = await SubjectProfile.findOneAndDelete({
          _id: profileId,
          teacher_id: teacherId,
        }).session(session);
      } else {
        profile = await SubjectProfile.findByIdAndDelete(profileId).session(session);
      }

      if (!profile) {
        const e = new Error("Profile not found or access denied");
        e.status = 404;
        throw e;
      }

      const ownerTeacherId = teacherId ? teacherId : profile.teacher_id;
      if (ownerTeacherId) {
        await Teacher.findByIdAndUpdate(
          ownerTeacherId,
          { $pull: { subject_profiles: profileId } },
          { session }
        );
      }
    });
  },

  createReview: async ({ profileId, userId, rating, comment }) => {
    return await runWithRetry(async (session) => {
      if (!mongoose.Types.ObjectId.isValid(profileId)) {
        throw new Error("Invalid profile ID");
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
      }

      const student = await Student.findById(userId).session(session);
      if (!student) throw new Error("Only students can create reviews");

      const existing = await Review.findOne({ subject_profile: profileId, User_ID: userId }).session(session);
      if (existing) {
        const err = new Error('Student already reviewed this profile');
        err.status = 409;
        throw err;
      }

      const review = new Review({
        subject_profile: profileId,
        User_ID: userId,
        Rate: rating,
        rating: rating,
        Comment: comment,
        comment: comment,
      });

      try {
        await review.save({ session });
      } catch (err) {
        if (err.code === 11000) {
          const e = new Error('Student already reviewed this profile');
          e.status = 409;
          throw e;
        }
        throw err;
      }
      await SubjectProfile.findByIdAndUpdate(
        profileId,
        { $addToSet: { reviews: review._id } },
        { session }
      );

      await updateRatingsForProfile(profileId, session);

      const populated = await Review.findById(review._id).populate('User_ID', 'name').session(session);
      return populated;
    });
  },

  updateReview: async (reviewId, userId, updateData) => {
    return await runWithRetry(async (session) => {
      if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        throw new Error("Invalid review ID");
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
      }

      const review = await Review.findOne({
        _id: reviewId,
        User_ID: userId
      }).session(session);

      if (!review) throw new Error("Review not found or access denied");

      if (updateData.Rate !== undefined) review.Rate = updateData.Rate;
      if (updateData.rating !== undefined) review.Rate = updateData.rating;
      if (updateData.Comment !== undefined) review.Comment = updateData.Comment;
      if (updateData.comment !== undefined) review.Comment = updateData.comment;

      await review.save({ session });

      await updateRatingsForProfile(review.subject_profile, session);

      const populated = await Review.findById(review._id).populate('User_ID', 'name').session(session);
      return populated;
    });
  },

  deleteReview: async (reviewId, userId) => {
    return await runWithRetry(async (session) => {
      if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        throw new Error("Invalid review ID");
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
      }

      const review = await Review.findOneAndDelete({
        _id: reviewId,
        User_ID: userId
      }).session(session);

      if (!review) throw new Error("Review not found or access denied");

      const profileId = review.subject_profile;

      await SubjectProfile.findByIdAndUpdate(
        profileId,
        { $pull: { reviews: review._id } },
        { session }
      );

      await updateRatingsForProfile(profileId, session);

      return review;
    });
  },

  getProfileReviews: async (profileId) => {
    return Review.find({ subject_profile: profileId }).populate('User_ID', 'name');
  },

  getAllSubjectsPublic: async () => {
    return Subject.find({})
      .select("name grade education_system language sector years_experience")
      .lean();
  },

  getSubjectsForTutor: async (tutorId, requesterId) => {
    // Accept either an ObjectId or a public identifier (username, email, slug)
    const query = mongoose.Types.ObjectId.isValid(tutorId)
      ? { _id: tutorId }
      : { $or: [{ username: tutorId }, { email: tutorId }, { slug: tutorId }] };

    const teacher = await Teacher.findOne(query)
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
            select: "name grade education_system sector language years_experience",
          },
          {
            path: "groups",
          },
          {
            path: "reviews",
            populate: {
              path: "User_ID",
              select: "name fullName username displayName img type"
            }
          }
        ],
      })
      .lean();

    if (!teacher) {
      console.warn(`getSubjectsForTutor: teacher not found for query=${JSON.stringify(query)}`);
      return { baseSubjects: [], subjectProfiles: [] };
    }

    return {
      baseSubjects: teacher.subjects || [],
      subjectProfiles: teacher.subject_profiles || [],
    };
  },
};
