import { SubjectService } from "../services/subject.service.js";
import mongoose from "mongoose";
import { Subject, SubjectProfile } from "../models/subject.js";

/**
 * Helper: determine if a value is a non-empty array or non-empty string
 */
function hasValue(v) {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "string") return v.trim().length > 0;
  return true;
}

/**
 * Normalize teacherIds input into array of valid ids
 */
function normalizeTeacherIds(input, requesterIsTeacher, requesterId) {
  if (requesterIsTeacher) return [requesterId];
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return [input];
}

export const SubjectController = {
  // ====================
  // BASE SUBJECTS
  // ====================
  createSubject: async (req, res) => {
    try {
      console.log('Creating subject with body:', req.body);
      console.log('User context:', req.user);

      // Validate required fields (language may be string or array)
      const requiredFields = ['name', 'grade', 'education_system', 'language'];
      const missingFields = requiredFields.filter(field => {
        const val = req.body?.[field];
        return !hasValue(val);
      });

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      const creatorIsTeacher = req.user?.type === 'Teacher';
      const requesterId = req.user?._id;

      // If requester is a teacher, force teacherIds to be the teacher only (ignore body.teacherIds)
      const teacherIds = normalizeTeacherIds(req.body.teacherIds, creatorIsTeacher, requesterId);

      // Pass the raw body through — SubjectService will normalize arrays, auto-assign sectors, and validate
      const payload = {
        ...req.body,
        teacherIds
      };

      const subject = await SubjectService.createSubject(payload);

      // If created/returned successfully
      return res.status(201).json(subject);
    } catch (err) {
      console.error('Subject creation error:', err);
      const status = err.status || 400;
      return res.status(status).json({ error: err.message || 'Subject creation failed' });
    }
  },

  getSubject: async (req, res) => {
    try {
      const subject = await SubjectService.getSubjectById(req.params.id);
      if (subject) return res.json(subject);
      return res.status(404).json({ error: "Subject not found" });
    } catch (err) {
      console.error('getSubject error:', err);
      const status = err.status || 500;
      return res.status(status).json({ error: err.message || "Failed to fetch subject" });
    }
  },

  updateSubject: async (req, res) => {
    try {
      // Note: updateData may include language/sector as string or array; SubjectService normalizes them.
      const updated = await SubjectService.updateSubject(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: "Subject not found" });
      return res.json(updated);
    } catch (err) {
      console.error('updateSubject error:', err);
      const status = err.status || 400;
      return res.status(status).json({ error: err.message || "Failed to update subject" });
    }
  },

  deleteSubject: async (req, res) => {
    const id = req.params.id;
    console.log(`[DELETE /subjects/:id] request id=${id}, user=${req.user?._id}`);

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.warn(`[DELETE /subjects/:id] invalid id format: ${id}`);
        return res.status(400).json({ error: "Invalid subject id" });
      }

      const deleted = await SubjectService.deleteSubject(id);

      if (!deleted) {
        console.warn(`[DELETE /subjects/:id] subject not found: ${id}`);
        return res.status(404).json({ error: "Subject not found" });
      }

      console.log(`[DELETE /subjects/:id] deleted subject id=${id}`);
      return res.status(204).end();
    } catch (err) {
      console.error(`[DELETE /subjects/:id] error deleting id=${id}`, err);
      if (err.message && err.message.toLowerCase().includes("referenc")) {
        return res.status(409).json({ error: err.message });
      }
      return res.status(500).json({ error: `Subject deletion failed: ${err.message}` });
    }
  },

  // ====================
  // SUBJECT PROFILES (Teacher-owned)
  // ====================
  createProfile: async (req, res) => {
    try {
      const creatorIsTeacher = req.user?.type === 'Teacher';
      const targetTeacherId = creatorIsTeacher ? req.user._id : req.body.teacher_id;

      if (!targetTeacherId) {
        return res.status(400).json({ error: "teacher_id is required" });
      }
      if (!mongoose.Types.ObjectId.isValid(targetTeacherId)) {
        return res.status(400).json({ error: "Invalid teacher_id" });
      }

      const subjectId = req.body.subject_id || req.body.subjectId;
      if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
        return res.status(400).json({ error: "Invalid or missing subject_id" });
      }

      const profile = await SubjectService.createProfile(targetTeacherId, {
        subject_id: subjectId,
        // more profile fields can be forwarded if needed
      });

      return res.status(201).json(profile);
    } catch (err) {
      console.error('createProfile error:', err);
      const status = err.status || 400;
      return res.status(status).json({ error: err.message || "Failed to create profile" });
    }
  },

  getProfile: async (req, res) => {
    try {
      const teacherId = req.user?.type === 'Teacher' ? req.user._id : null;
      const profile = await SubjectService.getProfileById(req.params.id, teacherId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      return res.json(profile);
    } catch (err) {
      console.error('getProfile error:', err);
      const status = err.status || (err.message && err.message.toLowerCase().includes('access') ? 403 : 400);
      return res.status(status).json({ error: err.message || "Failed to fetch profile" });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const teacherId = req.user?.type === 'Teacher' ? req.user._id : null;
      const updated = await SubjectService.updateProfile(req.params.id, req.body, teacherId);
      return res.json(updated);
    } catch (err) {
      console.error('updateProfile error:', err);
      const status = (err.message && err.message.toLowerCase().includes('access')) ? 403 : (err.status || 400);
      return res.status(status).json({ error: err.message || "Failed to update profile" });
    }
  },

  deleteProfile: async (req, res) => {
    try {
      const teacherId = req.user?.type === 'Teacher' ? req.user._id : null;
      await SubjectService.deleteProfile(req.params.id, teacherId);
      return res.status(204).end();
    } catch (err) {
      console.error('deleteProfile error:', err);
      const status = (err.message && err.message.toLowerCase().includes('access')) ? 403 : (err.status || 500);
      return res.status(status).json({ error: err.message || "Failed to delete profile" });
    }
  },

  // ====================
  // REVIEWS (Student-owned)
  // ====================
  createReview: async (req, res) => {
    try {
      const review = await SubjectService.createReview({
        profileId: req.body.profileId,
        userId: req.user._id,
        rating: req.body.rating,
        comment: req.body.comment
      });
      return res.status(201).json(review);
    } catch (err) {
      console.error('createReview error:', err);
      const status = err.status || (err.message && err.message.toLowerCase().includes('access') ? 403 : 400);
      return res.status(status).json({ error: err.message || "Failed to create review" });
    }
  },

  updateReview: async (req, res) => {
    try {
      const updated = await SubjectService.updateReview(
        req.params.id,
        req.user._id,
        { Rate: req.body.rating, Comment: req.body.comment, rating: req.body.rating, comment: req.body.comment }
      );
      return res.json(updated);
    } catch (err) {
      console.error('updateReview error:', err);
      const status = err.status || (err.message && err.message.toLowerCase().includes('access') ? 403 : 400);
      return res.status(status).json({ error: err.message || "Failed to update review" });
    }
  },

  deleteReview: async (req, res) => {
    try {
      await SubjectService.deleteReview(req.params.id, req.user._id);
      return res.status(204).end();
    } catch (err) {
      console.error('deleteReview error:', err);
      const status = err.status || (err.message && err.message.toLowerCase().includes('access') ? 403 : 400);
      return res.status(status).json({ error: err.message || "Failed to delete review" });
    }
  },

  getProfileReviews: async (req, res) => {
    try {
      const reviews = await SubjectService.getProfileReviews(req.params.profileId);
      return res.json(reviews);
    } catch (err) {
      console.error('getProfileReviews error:', err);
      return res.status(500).json({ error: "Failed to fetch reviews" });
    }
  },

  // ====================
  // PUBLIC QUERIES
  // ====================
  getAllSubjectsPublic: async (req, res) => {
    try {
      const subjects = await SubjectService.getAllSubjectsPublic();
      return res.json(subjects);
    } catch (err) {
      console.error('getAllSubjectsPublic error:', err);
      return res.status(500).json({ error: "Failed to fetch subjects" });
    }
  },

  getSubjectsForTutor: async (req, res) => {
    console.log("Tutor ID param:", req.params.tutorId);
    console.log("User from token:", req.user);

    const tutorId = req.params.tutorId;

    try {
      const requesterId = req.user ? req.user._id : null;
      const result = await SubjectService.getSubjectsForTutor(tutorId, requesterId);

      return res.json({ success: true, data: result });
    } catch (err) {
      console.error('getSubjectsForTutor error:', err);
      const status = (err.message && err.message.toLowerCase().includes('access')) ? 403 : (err.message && err.message.toLowerCase().includes('not found') ? 404 : 500);
      return res.status(status).json({ success: false, error: err.message });
    }
  },

  updateAny: async (req, res) => {
    try {
      const { type, id, data } = req.body;

      if (!type || !id || !data) {
        return res.status(400).json({ error: "Missing type, id, or data" });
      }

      let updated;
      if (type === "subject") {
        updated = await SubjectService.updateSubject(id, data);
      } else if (type === "profile") {
        const teacherId = req.user?.type === 'Teacher' ? req.user._id : null;
        updated = await SubjectService.updateProfile(id, data, teacherId);
      } else {
        return res.status(400).json({ error: "Invalid type. Use 'subject' or 'profile'" });
      }

      return res.json({ success: true, updated });
    } catch (err) {
      console.error('updateAny error:', err);
      const status = (err.message && err.message.toLowerCase().includes('access')) ? 403 : (err.status || 400);
      return res.status(status).json({ success: false, error: err.message });
    }
  }
};
