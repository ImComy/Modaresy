import { Review } from "../models/subjectRelated.js";
import { compareHash, get_token } from "../services/authentication.service.js";

export async function login(req, res) {
    try {
        const input_data = req.body

        const { isMatch, id } = await compareHash(input_data.password, input_data.username, "Admin");
        if (!isMatch) return res.status(400).json({ error: "password or username is invalid" })

        const token = await get_token(id, "Admin");
        if (!token) return res.status(400).json({ error: "cannot generate a token!" });

        return res.status(200).json({ message: "user login successfully!", token })
    } catch (err) {
        return res.status(500).json({ error: "Internal server error: " + err.message })
    }
}
export async function removeTutor(req, res) {
    try {
        const { teacher } = req;
        if (!teacher) return res.status(404).json({ error: "Teacher not found" });

        await teacher.remove();
        return res.status(200).json({ message: "Teacher removed successfully" });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error: " + err.message });
    }
}
export async function removeStudent(req, res) {
    try {
        const { student } = req;
        if (!student) return res.status(404).json({ error: "Student not found" });

        await student.remove();
        return res.status(200).json({ message: "Student removed successfully" });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error: " + err.message });
    }
}
export async function updateStudent(req, res) {
  try {
    const { student } = req;
    if (!student) return res.status(404).json({ error: "Student not found" });

    const { updated_information } = req.body;
    if (!updated_information || typeof updated_information !== 'object') {
      return res.status(400).json({ error: "Invalid update payload" });
    }

    Object.assign(student, updated_information);
    await student.save();

    return res.status(200).json({ message: "Student updated successfully", student });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
}

export async function approveReview(req, res){
  try{
    const {reviewId} = req.body
    const accepted_review = await Review.findByIdAndUpdate(reviewId, { approved: true });
    if (!accepted_review) {
      return res.status(404).json({ error: "Review not found" });
    }
  }catch(err){
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
}

export async function rejectReview(req, res){
  try{
    const {reviewId} = req.body
    const rejected_review = await Review.findByIdAndUpdate(reviewId, { approved: false });
    if (!rejected_review) {
      return res.status(404).json({ error: "Review not found" });
    }
  }catch(err){
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
}

export async function loadPendingReviews(req, res) {
    try {
        const { pages, limit } = req.query;
        if (!pages || !limit) {
            return res.status(400).json({ error: "Pages and limit parameters are required" });
        }

        pages = parseInt(pages) || 1;
        limit = parseInt(limit) || 10;
        const NumberOfResults = pages * limit;

        const pendingReviews = await Review.find({ approved: false })
        .limit(NumberOfResults)
        .exec();
        
        if (!pendingReviews || pendingReviews.length === 0) {
            return res.status(404).json({ message: "No pending reviews found" });
        }
        return res.status(200).json(pendingReviews);
    } catch (err) {
        return res.status(500).json({ error: "Internal server error: " + err.message });
    }
}

export async function updateTutor(req, res) {
  try {
    const { teacher } = req;

    const { updated_information } = req.body;
    if (!updated_information || typeof updated_information !== 'object') {
      return res.status(400).json({ error: "Invalid update payload" });
    }

    Object.assign(teacher, updated_information);
    await teacher.save();

    return res.status(200).json({ message: "Tutor updated successfully", teacher });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
}