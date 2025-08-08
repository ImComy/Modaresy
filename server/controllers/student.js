import {
  whatsappContactAPI,
  sendEnrollmentRequest
} from '../services/student.service.js';

import {
  getProfileData
} from '../services/authentication.service.js';

import { Wishlist } from '../models/misc.js';
import mongoose from 'mongoose';

export function isStudent(user) {
  return user?.type === 'Student';
}

export const addToWishlist = async (req, res) => {
  try {
    const { tutorId } = req.body;
    const idToStore = String(tutorId);

    let wishlist;
    if (!req.user.wishlist_id) {
      wishlist = new Wishlist({ teacher_ids: [idToStore] });
      await wishlist.save();
      req.user.wishlist_id = wishlist._id;
    } else {
      wishlist = await Wishlist.findById(req.user.wishlist_id);
      
      if (wishlist.teacher_ids.includes(idToStore)) {
        return res.status(400).json({ error: "Tutor already in wishlist" });
      }
      
      wishlist.teacher_ids.push(idToStore);
    }
    
    await wishlist.save();
    await req.user.save();

    return res.status(200).json({ 
      message: "Tutor added to wishlist",
      wishlist: wishlist.teacher_ids 
    });
  } catch (err) {
    console.error("Wishlist error:", err);
    return res.status(500).json({ 
      error: "Failed to add tutor to wishlist",
      details: err.message 
    });
  }
};

export const getWishlistIds = async (req, res) => {
  try {
    if (!req.user.wishlist_id) {
      return res.status(200).json({ tutorIds: [] });
    }
    
    const wishlist = await Wishlist.findById(req.user.wishlist_id);
    if (!wishlist) {
      return res.status(200).json({ tutorIds: [] });
    }
    
    return res.status(200).json({ tutorIds: wishlist.teacher_ids });
  } catch (err) {
    return res.status(500).json({ 
      error: "Failed to fetch wishlist", 
      details: err.message 
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { tutorId } = req.body;
    const wishlist = await Wishlist.findById(req.user.wishlist_id); // Need to actually fetch it
    
    if (!wishlist) return res.status(404).json({ error: "Wishlist not found" });
    
    // Convert to string for consistency
    const idToRemove = String(tutorId);
    
    if (!wishlist.teacher_ids.includes(idToRemove)) {
      return res.status(400).json({ error: "Tutor not in wishlist" });
    }
    
    wishlist.teacher_ids = wishlist.teacher_ids.filter(id => id !== idToRemove);
    await wishlist.save();
    
    return res.status(200).json({ 
      message: "Tutor removed from wishlist",
      tutorIds: wishlist.teacher_ids 
    });
  } catch (err) {
    return res.status(500).json({ 
      error: "Failed to remove tutor", 
      details: err.message 
    });
  }
};

export async function getProfile(req, res) {

  try {
    const profileData = await getProfileData(req.user);
    return res.status(200).json({ userdata: profileData });
  } catch (err) {
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
