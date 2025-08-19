import { SubjectService } from "../services/subject.service.js";
import mongoose from "mongoose";
import { Subject, SubjectProfile } from "../models/subject.js";

export const SubjectController = {
  // ====================
  // BASE SUBJECTS
  // ====================
  createSubject: async (req, res) => {
    try {
      console.log('Creating subject with body:', req.body);
      console.log('User context:', req.user);

      // Validate required fields
      const requiredFields = ['name', 'grade', 'education_system', 'language'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      const teacherIds = req.user?.type === 'Teacher' 
        ? [req.user._id] 
        : req.body.teacherIds || [];
      
      console.log('Teacher IDs for subject:', teacherIds);

      const subject = await SubjectService.createSubject({
        ...req.body,
        teacherIds: teacherIds
      });
      
      res.status(201).json(subject);
    } catch (err) {
      console.error('Subject creation error:', err);
      res.status(400).json({ error: err.message });
    }
  },

  getSubject: async (req, res) => {
    try {
      const subject = await SubjectService.getSubjectById(req.params.id);
      subject
        ? res.json(subject)
        : res.status(404).json({ error: "Subject not found" });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch subject" });
    }
  },

  updateSubject: async (req, res) => {
    try {
      const updated = await SubjectService.updateSubject(req.params.id, req.body);
      updated
        ? res.json(updated)
        : res.status(404).json({ error: "Subject not found" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

deleteSubject: async (req, res) => {
  const id = req.params.id;
  console.log(`[DELETE /subjects/:id] request id=${id}, user=${req.user?._id}`);

  try {
    // Basic id validation to avoid unnecessary DB calls
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.warn(`[DELETE /subjects/:id] invalid id format: ${id}`);
      return res.status(400).json({ error: "Invalid subject id" });
    }

    const deleted = await SubjectService.deleteSubject(id);

    // If your service returns null when not found (recommended), handle that:
    if (!deleted) {
      console.warn(`[DELETE /subjects/:id] subject not found: ${id}`);
      return res.status(404).json({ error: "Subject not found" });
    }

    console.log(`[DELETE /subjects/:id] deleted subject id=${id}`);
    // 204: No Content is appropriate for successful DELETE
    return res.status(204).end();
  } catch (err) {
    // If service throws with a clear message, we map conflict vs server error.
    console.error(`[DELETE /subjects/:id] error deleting id=${id}`, err);

    if (err.message && err.message.toLowerCase().includes("referenc")) {
      // e.g. "referenced" -> conflict because profiles/reviews exist
      return res.status(409).json({ error: err.message });
    }

    // For all other unexpected errors return 500 and include minimal message
    return res.status(500).json({ error: `Subject deletion failed: ${err.message}` });
  }
},

  // ====================
  // SUBJECT PROFILES (Teacher-owned)
  // ====================
  createProfile: async (req, res) => {
    try {
      const profile = await SubjectService.createProfile(req.user._id, {
        subject_id: req.body.subject_id,
        // ... other profile data
      });
      res.status(201).json(profile);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  getProfile: async (req, res) => {
    try {
      const profile = await SubjectService.getProfileById(
        req.params.id,
        req.user._id
      );
      profile
        ? res.json(profile)
        : res.status(404).json({ error: "Profile not found" });
    } catch (err) {
      res.status(403).json(err);
    }
  },

  updateProfile: async (req, res) => {
    try {
      const updated = await SubjectService.updateProfile(
        req.params.id,
        req.body,
        req.user._id
      );
      res.json(updated);
    } catch (err) {
      const status = err.message.includes("Access") ? 403 : 400;
      res.status(status).json({ error: err.message });
    }
  },

  deleteProfile: async (req, res) => {
    try {
      await SubjectService.deleteProfile(req.params.id, req.user._id);
      res.status(204).end();
    } catch (err) {
      const status = err.message.includes("Access") ? 403 : 500;
      res.status(status).json({ error: err.message });
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
      res.status(201).json(review);
    } catch (err) {
      res.status(403).json({ error: err.message }); // 403 for permission issues
    }
  },

  updateReview: async (req, res) => {
    try {
      const updated = await SubjectService.updateReview(
        req.params.id,
        req.user._id,
        { Rate: req.body.rating, Comment: req.body.comment }
      );
      res.json(updated);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  },

  deleteReview: async (req, res) => {
    try {
      await SubjectService.deleteReview(req.params.id, req.user._id);
      res.status(204).end();
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  },

  getProfileReviews: async (req, res) => {
    try {
      const reviews = await SubjectService.getProfileReviews(req.params.profileId);
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  },

  // ====================
  // PUBLIC QUERIES
  // ====================
  getAllSubjectsPublic: async (req, res) => {
    try {
      const subjects = await SubjectService.getAllSubjectsPublic();
      res.json(subjects);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  },

getSubjectsForTutor: async (req, res) => {
  console.log("Tutor ID param:", req.params.tutorId);
  console.log("User from token:", req.user);

  const tutorId = req.params.tutorId;

  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const result = await SubjectService.getSubjectsForTutor(
      tutorId,
      req.user._id
    );

    res.json({ success: true, data: result });
  } catch (err) {
    const status = err.message.includes("Access")
      ? 403
      : err.message.includes("not found")
      ? 404
      : 500;
    res.status(status).json({ success: false, error: err.message });
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
      updated = await SubjectService.updateProfile(id, data, req.user._id);
    } else {
      return res.status(400).json({ error: "Invalid type. Use 'subject' or 'profile'" });
    }

    res.json({ success: true, updated });
  } catch (err) {
    const status = err.message.includes("Access") ? 403 : 400;
    res.status(status).json({ success: false, error: err.message });
  }
}


};
