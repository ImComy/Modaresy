import mongoose from 'mongoose';
import Student from '../models/student.js';
import { Teacher, Enrollment, EnrollmentRequest } from '../models/teacher.js';
import User from '../models/user.js';
import { SubjectProfile, Subject } from '../models/subject.js';
import { Review, Group } from '../models/subjectRelated.js';
import { Wishlist, PersonalAvailability, Report } from '../models/misc.js';
import { get_token, compareHash } from '../services/authentication.service.js';
import bcrypt from 'bcrypt';
import { getCachedUserStats, calculateUserStats } from '../events/user_stats.js';
import { Blog } from '../models/blog.js';

export async function createAccount(req, res) {
  try {
    const userData = req.body;

    let user;
    if (userData.type === "Student") {
      user = new Student(userData);
    } else if (userData.type === "Teacher") {
      user = new Teacher(userData);
    } else {
      return res.status(400).json({ error: "Invalid user type." });
    }

    await user.save();
    return res.status(201).json({ message: "Account created successfully!", id: user._id, email: user.email });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const { isMatch, id } = await compareHash(password, email, "User");
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = await get_token(id, "User");
    if (!token) {
      return res.status(500).json({ error: "Failed to generate token." });
    }

    return res.status(200).json({ message: "Login successful!", token });
  } catch (err) {
    return res.status(500).json({ error: "Login failed.", details: err.message });
  }
}

export async function stats(req, res) {
  try {
    const cachedStats = getCachedUserStats();
    const stats = cachedStats || await calculateUserStats();
    return res.status(200).json(stats);
  } catch (err) {
    return res.status(500).json({ error: "Failed to retrieve user stats.", details: err.message });
  }
}

export async function deleteAccount(req, res) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  // Require password confirmation for account deletion
  const providedPassword = req.body?.password;
  if (!providedPassword) {
    return res.status(400).json({ error: 'Password is required to delete account' });
  }

  const passwordMatches = await bcrypt.compare(providedPassword, user.password);
  if (!passwordMatches) {
    console.warn('deleteAccount: password mismatch for user', user._id.toString());
    return res.status(401).json({ error: 'Password incorrect' });
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const userId = user._id;
      console.log('Start deletion for user:', userId.toString(), 'type:', user.type);

      // ---------- COMMON (all users) ----------
      // Reports where user is reporter or reported
      const reportsRes = await Report.deleteMany(
        { $or: [{ Reporter_ID: userId }, { Reported_ID: userId }] },
        { session }
      );
      console.log('Reports deleted:', reportsRes.deletedCount || 0);

      // Remove user's likes & comments from all blogs (comments are subdocs)
      const blogUpdateRes = await Blog.updateMany(
        { $or: [{ likes: userId }, { 'comments.user': userId }] },
        { $pull: { likes: userId, comments: { user: userId } } },
        { session }
      );
      console.log('Blogs updated (removed likes/comments):', blogUpdateRes.modifiedCount ?? blogUpdateRes.nModified ?? 0);

      // ---------- STUDENT-SPECIFIC ----------
      if (user.type === 'Student') {
        console.log('Performing student-specific deletions for:', userId.toString());

        // Delete student's wishlist document (User.wishlist_id)
        if (user.wishlist_id) {
          const wishlistRes = await Wishlist.deleteOne({ _id: user.wishlist_id }, { session });
          console.log('Student wishlist deleted:', wishlistRes.deletedCount || 0, 'id:', user.wishlist_id.toString());
        }

        // Delete reviews authored by this student
        const studentReviewsRes = await Review.deleteMany({ User_ID: userId }, { session });
        console.log('Student reviews deleted:', studentReviewsRes.deletedCount || 0);

        // Enrollments where student is enrolled -> delete and remove references from teachers
        const studentEnrollments = await Enrollment.find({ studentId: userId }).session(session);
        const studentEnrollmentIds = studentEnrollments.map(e => e._id);
        console.log('Student enrollments found:', studentEnrollmentIds.length);
        if (studentEnrollmentIds.length) {
          const delEnrollRes = await Enrollment.deleteMany({ _id: { $in: studentEnrollmentIds } }, { session });
          console.log('Student enrollments deleted:', delEnrollRes.deletedCount || 0);
          // pull from Teacher.enrollments arrays
          const teacherPullEnroll = await Teacher.updateMany(
            { enrollments: { $in: studentEnrollmentIds } },
            { $pullAll: { enrollments: studentEnrollmentIds } },
            { session }
          );
          console.log('Teacher enrollments arrays updated (removed refs):', teacherPullEnroll.modifiedCount ?? teacherPullEnroll.nModified ?? 0);
        }

        // Enrollment requests sent by student -> delete and remove references from teachers
        const studentRequests = await EnrollmentRequest.find({ studentId: userId }).session(session);
        const studentRequestIds = studentRequests.map(r => r._id);
        console.log('Student enrollment requests found:', studentRequestIds.length);
        if (studentRequestIds.length) {
          const delReqRes = await EnrollmentRequest.deleteMany({ _id: { $in: studentRequestIds } }, { session });
          console.log('Student enrollment requests deleted:', delReqRes.deletedCount || 0);
          const teacherPullReq = await Teacher.updateMany(
            { enrollmentsRequests: { $in: studentRequestIds } },
            { $pullAll: { enrollmentsRequests: studentRequestIds } },
            { session }
          );
          console.log('Teacher enrollmentRequests arrays updated (removed refs):', teacherPullReq.modifiedCount ?? teacherPullReq.nModified ?? 0);
        }
      }

      // ---------- TEACHER-SPECIFIC ----------
      if (user.type === 'Teacher') {
        console.log('Performing teacher-specific deletions for:', userId.toString());

        // Delete blogs authored by this teacher
        const delBlogsRes = await Blog.deleteMany({ teacher: userId }, { session });
        console.log('Teacher blogs deleted:', delBlogsRes.deletedCount || 0);

        // SubjectProfiles owned by this teacher
        const subjectProfiles = await SubjectProfile.find({ teacher_id: userId }).session(session);
        const profileIds = subjectProfiles.map(p => p._id);
        console.log('SubjectProfiles found for teacher:', profileIds.length);

        if (profileIds.length) {
          // Delete reviews linked to these subject profiles
          const delProfileReviewsRes = await Review.deleteMany({ subject_profile: { $in: profileIds } }, { session });
          console.log('Reviews for subjectProfiles deleted:', delProfileReviewsRes.deletedCount || 0);

          // Collect and delete groups referenced by subjectProfiles
          const groupIds = subjectProfiles.flatMap(p => (p.groups || []).map(g => g && g.toString())).filter(Boolean);
          console.log('Group IDs referenced by profiles:', groupIds.length);
          if (groupIds.length) {
            const delGroupsRes = await Group.deleteMany({ _id: { $in: groupIds } }, { session });
            console.log('Groups deleted:', delGroupsRes.deletedCount || 0);
          }

          // Delete the subject profiles
          const delProfilesRes = await SubjectProfile.deleteMany({ teacher_id: userId }, { session });
          console.log('SubjectProfiles deleted:', delProfilesRes.deletedCount || 0);
        }

        // Delete personal availability doc if exists
        if (user.availability) {
          const delAvailabilityRes = await PersonalAvailability.deleteOne({ _id: user.availability }, { session });
          console.log('PersonalAvailability deleted:', delAvailabilityRes.deletedCount || 0, 'id:', user.availability.toString());
        }

        // Enrollments where teacher is tutor -> delete
        const tutorEnrollments = await Enrollment.find({ tutorId: userId }).session(session);
        const tutorEnrollmentIds = tutorEnrollments.map(e => e._id);
        console.log('Tutor enrollments found:', tutorEnrollmentIds.length);
        if (tutorEnrollmentIds.length) {
          const delTutorEnrollRes = await Enrollment.deleteMany({ _id: { $in: tutorEnrollmentIds } }, { session });
          console.log('Tutor enrollments deleted:', delTutorEnrollRes.deletedCount || 0);
        }

        // EnrollmentRequests targeted to this tutor -> delete
        const tutorRequests = await EnrollmentRequest.find({ tutorId: userId }).session(session);
        const tutorRequestIds = tutorRequests.map(r => r._id);
        console.log('Tutor enrollment requests found:', tutorRequestIds.length);
        if (tutorRequestIds.length) {
          const delTutorReqRes = await EnrollmentRequest.deleteMany({ _id: { $in: tutorRequestIds } }, { session });
          console.log('Tutor enrollment requests deleted:', delTutorReqRes.deletedCount || 0);
        }

        // Remove this teacher from all wishlists (wishlist.teacher_ids is string array)
        const wishlistPullRes = await Wishlist.updateMany(
          { teacher_ids: userId.toString() },
          { $pull: { teacher_ids: userId.toString() } },
          { session }
        );
        console.log('Removed teacher id from wishlists:', wishlistPullRes.modifiedCount ?? wishlistPullRes.nModified ?? 0);
      }

      // ---------- FINAL: Delete the user document ----------
      const delUserRes = await User.deleteOne({ _id: userId }, { session });
      console.log('User document deleted:', delUserRes.deletedCount || 0, 'id:', userId.toString());
    });

    session.endSession();
    console.log('Account deletion transaction completed successfully for user:', user._id.toString());
    return res.status(200).json({ message: 'Account and related data deleted' });
  } catch (err) {
    console.error('Error during account deletion:', err);
    try {
      await session.abortTransaction();
    } catch (abortErr) {
      console.error('Error aborting transaction:', abortErr);
    }
    session.endSession();
    return res.status(500).json({ error: 'Failed to delete account', details: err.message });
  }
}

/*
How to add new cleanup steps:
- Find the relevant model and relationship in your schemas.
- Add the model import at top (adjust path).
- Add a deletion/update step inside the appropriate block:
  - Common (all users)
  - Student-specific (user.type === 'Student')
  - Teacher-specific (user.type === 'Teacher')
- Use `deleteMany`, `deleteOne`, or `updateMany` with the current transaction `session`.
- Add a single concise console.log right after the operation to report counts/ids.
*/


