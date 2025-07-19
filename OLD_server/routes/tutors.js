import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { registerLimiter } from "../middleware/rateLimit.js";
import { User } from "../models/user.js";
import { SubjectProfile, Subject } from "../models/subject.js";
import mongoose from "mongoose";

const router = express.Router();

const deepPopulateSubjectProfiles = {
  path: "subject_profiles",
  populate: [
    { path: "subject_id", model: "Subject" },
    { path: "private_pricing", model: "PrivatePricing" },
    { path: "offer_id", model: "Offer" },
    { path: "groups", model: "Group" },
    { path: "reviews", model: "Review", populate: { path: "User_ID", model: "User" } },
    { path: "additional_pricing", model: "AdditionalPricing" },
    { path: "youtube", model: "YouTubeLink" }
  ]
};

router.get("/loadTutors", async (req, res) => {
  try {
    const tutors = await User.find({ type: "Teacher" })
      .populate(deepPopulateSubjectProfiles)
      .populate("availability")
      .populate("achievements")
      .lean();

    const cleanedTutors = tutors.map(tutor => {
      delete tutor.password;
      delete tutor.verificationCode;
      delete tutor.codeExpiresAt;
      delete tutor.last_login;

      if (Array.isArray(tutor.subject_profiles)) {
        tutor.subject_profiles = tutor.subject_profiles.map(profile => {
          const plain = { ...profile };
          plain.subject = profile.subject_id;
          delete plain.subject_id;
          return plain;
        });
      }

      return tutor;
    });

    res.status(200).json(cleanedTutors);
  } catch (err) {
    console.error("Failed to load tutors:", err);
    res.status(500).json({ error: "Something went wrong while fetching tutors" });
  }
});

router.get("/loadTutorsFiltered/:Grade/:Sector/:Language/:Governate/:MinimumRating/:MinMonthlyRange/:MaxMonthlyRange",
  async (req, res) => {
    try {
      const {
        Grade,
        Sector,
        Language,
        Governate,
        MinimumRating,
        MinMonthlyRange,
        MaxMonthlyRange
      } = req.params;

      const teachers = await User.find({
        type: "Teacher",
        rating: { $gte: Number(MinimumRating) },
        governate: Governate,
        grades: Grade,
        sectors: Sector,
        languages: Language
      })
        .populate(deepPopulateSubjectProfiles)
        .lean();

      const filtered = teachers.map(tutor => {
        delete tutor.password;
        delete tutor.verificationCode;
        delete tutor.codeExpiresAt;
        delete tutor.last_login;

        tutor.subject_profiles = (tutor.subject_profiles || []).filter(profile => {
          const matchPrice = profile.group_pricing >= Number(MinMonthlyRange) &&
                             profile.group_pricing <= Number(MaxMonthlyRange);

          return (
            profile &&
            profile.subject_id &&
            profile.subject_id.grade === Grade &&
            profile.subject_id.sector === Sector &&
            profile.subject_id.language === Language &&
            matchPrice
          );
        }).map(profile => {
          const plain = { ...profile };
          plain.subject = profile.subject_id;
          delete plain.subject_id;
          return plain;
        });

        return tutor;
      }).filter(tutor => tutor.subject_profiles.length > 0);

      res.status(200).json(filtered);
    } catch (err) {
      console.error("Error filtering tutors:", err);
      res.status(500).json({ error: "Something went wrong while filtering tutors" });
    }
  }
);

router.get("/getTopTutorsFiltered/:Grade/:Sector/:Language", async (req, res) => {
  try {
    const { Grade, Sector, Language } = req.params;

    const topTutors = await User.find({
      type: "Teacher",
      isTop: true,
      grades: Grade,
      sectors: Sector,
      languages: Language
    })
      .populate(deepPopulateSubjectProfiles)
      .lean();

    const filtered = topTutors.map(tutor => {
      delete tutor.password;
      delete tutor.verificationCode;
      delete tutor.codeExpiresAt;
      delete tutor.last_login;

      tutor.subject_profiles = (tutor.subject_profiles || []).filter(profile => {
        return (
          profile &&
          profile.subject_id &&
          profile.subject_id.grade === Grade &&
          profile.subject_id.sector === Sector &&
          profile.subject_id.language === Language
        );
      }).map(profile => {
        const plain = { ...profile };
        plain.subject = profile.subject_id;
        delete plain.subject_id;
        return plain;
      });

      return tutor;
    }).filter(tutor => tutor.subject_profiles.length > 0);

    res.status(200).json(filtered);
  } catch (err) {
    console.error("Error getting top filtered tutors:", err);
    res.status(500).json({ error: "Something went wrong while fetching top tutors." });
  }
});

router.get("/getTopTutors/:Grade/:Sector/:Language", async (req, res) => {
  try {
    const { Grade, Sector, Language } = req.params;

    const topTutors = await User.find({
      type: "Teacher",
      grades: Grade,
      sectors: Sector,
      languages: Language
    })
      .sort({ rating: -1 })
      .populate(deepPopulateSubjectProfiles)
      .lean();

    const filtered = topTutors.map(tutor => {
      delete tutor.password;
      delete tutor.verificationCode;
      delete tutor.codeExpiresAt;
      delete tutor.last_login;

      tutor.subject_profiles = (tutor.subject_profiles || []).filter(profile => {
        return (
          profile &&
          profile.subject_id &&
          profile.subject_id.grade === Grade &&
          profile.subject_id.sector === Sector &&
          profile.subject_id.language === Language
        );
      }).map(profile => {
        const plain = { ...profile };
        plain.subject = profile.subject_id;
        delete plain.subject_id;
        return plain;
      });

      return tutor;
    }).filter(tutor => tutor.subject_profiles.length > 0);

    res.status(200).json(filtered);
  } catch (err) {
    console.error("Error fetching top tutors:", err);
    res.status(500).json({ error: "Something went wrong while fetching top tutors." });
  }
});

router.get("/loadTutor/:tutorID", async (req, res) => {
  try {
    const { tutorID } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tutorID)) {
      return res.status(400).json({ error: "Invalid tutor ID format" });
    }

    const teacher = await User.findById(tutorID)
      .populate(deepPopulateSubjectProfiles)
      .populate("availability")
      .populate("achievements")
      .lean();

    if (!teacher) {
      return res.status(404).json({ warn: "User not found" });
    }

    delete teacher.password;
    delete teacher.verificationCode;
    delete teacher.codeExpiresAt;
    delete teacher.last_login;

    if (teacher.subject_profiles?.length) {
      teacher.subject_profiles = teacher.subject_profiles.map(profile => {
        const plain = { ...profile };
        plain.subject = profile.subject_id;
        delete plain.subject_id;
        return plain;
      });
    }

    return res.status(200).json(teacher);
  } catch (err) {
    console.error("Error loading tutor:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/loadDashboard/:token", (req, res) => {
  // TODO
});

export default router;
