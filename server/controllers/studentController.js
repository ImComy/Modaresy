import { Review } from "../models/subjectRelated.js";
import { User } from "../models/user.js";
import { Wishlist, Report } from "../models/others.js";

export const reviewTutor = async (req, res) => {
  try {
    const { tutorId, rating, comment } = req.body;
    const studentId = req.user._id;

    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.type !== "Teacher") return res.status(404).json({ error: "Tutor not found" });

    const review = new Review({
      User_ID: studentId,
      subject_profile,
      Rate,
      Comment
    });
    await review.save();

    res.status(201).json({ message: "Review submitted", review });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit review", details: err.message });
  }
};

export const contactTutor = async (req, res) => {
  try {
    const { tutorId } = req.body;

    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.type !== "Teacher") {
      return res.status(404).json({ error: "Tutor not found" });
    }

    res.status(200).json({ phone_number: tutor.phone_number });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve tutor's contact", details: err.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { tutorId } = req.body;
    const student = await User.findById(req.user._id);

    const wishlist = await Wishlist.findById(student.wishlist_id);
    if (!wishlist) return res.status(404).json({ error: "Wishlist not found" });

    if (wishlist.ids_of_teachers.includes(tutorId))
      return res.status(400).json({ error: "Tutor is already in the wishlist" });

    wishlist.ids_of_teachers.push(tutorId);
    await wishlist.save();

    res.status(200).json({ message: "Tutor added to wishlist" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add tutor to wishlist", details: err.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { tutorId } = req.body;
    const student = await User.findById(req.user._id);

    const wishlist = await Wishlist.findById(student.wishlist_id);
    if (!wishlist) return res.status(404).json({ error: "Wishlist not found" });

    const index = wishlist.ids_of_teachers.indexOf(tutorId);
    if (index === -1)
      return res.status(400).json({ error: "Tutor not found in wishlist" });

    wishlist.ids_of_teachers.splice(index, 1);
    await wishlist.save();

    res.status(200).json({ message: "Tutor removed from wishlist" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove tutor from wishlist", details: err.message });
  }
};

export const reportTutor = async (req, res) => {
  try {
    const { tutorId, Reason } = req.body;

    const report = new Report({
      Reporter_ID: req.user._id,
      Reported_ID: tutorId,
      Reason,
      Type: "Tutor"
    });

    await report.save();
    res.status(201).json({ message: "Report submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report", details: err.message });
  }
};
