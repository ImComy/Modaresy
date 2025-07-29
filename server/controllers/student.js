import {
  whatsappContactAPI,
  sendEnrollmentRequest
} from '../services/student.service.js';

import {
  getProfileData
} from '../services/authentication.service.js';

export function isStudent(user) {
  return user?.user_type === 'student';
}

export const addToWishlist = async (req, res) => {
  if (!isStudent(req.user)) {
    return res.status(403).json({ error: "Only students can use this feature" });
  }

  try {
    const { tutorId } = req.body;
    const wishlist = req.user.wishlist;

    if (wishlist.teacher_ids.includes(tutorId))
      return res.status(400).json({ error: "Tutor is already in the wishlist" });

    wishlist.teacher_ids.push(tutorId);
    await wishlist.save();

    return res.status(200).json({ message: "Tutor added to wishlist" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to add tutor to wishlist", details: err.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  if (!isStudent(req.user)) {
    return res.status(403).json({ error: "Only students can use this feature" });
  }

  try {
    const { tutorId } = req.body;
    const wishlist = req.user.wishlist;

    if (!wishlist.teacher_ids.includes(tutorId))
      return res.status(400).json({ error: "Tutor doesn't exist in the wishlist" });

    const index = wishlist.teacher_ids.indexOf(tutorId);
    wishlist.teacher_ids.splice(index, 1);
    
    await wishlist.save();
    return res.status(200).json({ message: "Tutor removed from wishlist" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to remove tutor from wishlist", details: err.message });
  }
};

export async function getProfile(req, res) {
  console.log('entered getProfile, req.user:', req.user);

  try {
    const profileData = await getProfileData(req.user);
    console.log('profile data prepared:', profileData);
    return res.status(200).json({ userdata: profileData });
  } catch (err) {
    console.error('getProfile error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}



export async function updateProfile(req, res) {
  try {
    const { updated_information } = req.body;
    Object.assign(req.user, updated_information);
    await req.user.save();

    return res.status(200).json({ message: "Profile updated" });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function contactTutor(req, res) {
  if (!isStudent(req.user)) {
    return res.status(403).json({ error: "Only students can contact tutors" });
  }

  try {
    return res.status(200).json({
      link: whatsappContactAPI(
        req.teacher.phone_number,
        `Hello! I'm ${req.user.name}, I am interested about knowing your groups and teaching details, Mr/Ms ${req.teacher.name}`
      )
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function requestEnrollment(req, res) {
  if (!isStudent(req.user)) {
    return res.status(403).json({ error: "Only students can request enrollment" });
  }

  try {
    const r = await sendEnrollmentRequest(req.user, req.teacher);
    return res.status(r.status).json(r.message);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
