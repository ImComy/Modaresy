// Modules

// Models
import Wishlist from '../models/misc.js'

// Constants

// Functions
export function isStudent(req, res, next){
    if (req.user && req.user.type == "Student"){
        next()
    }else{
        return res.status(400).json({error: "user isn't a student"})
    }
}

export async function getWishlist(req, res, next){
    try{
        const wishlist = await Wishlist.findById(req.user.wishlist_id);
        req.user.wishlist = wishlist
        next()
    }catch(err){
        return res.status(404).json({ error: "Wishlist not found" });
    }
}

export const whatsappContactAPI = (phoneNumber, text) =>
  `https://api.whatsapp.com/send?phone=2${phoneNumber}&text=${encodeURIComponent(text)}`;

export async function sendEnrollmentRequest(user, teacher){
    try{
        if (!teacher.enrollments.includes[user._id]){
            teacher.enrollments.push(user._id)
            await teacher.save()
            return {message: "enrollment request sent successfully!", status: 200}
        }else{
            return {message: "enrollment request is already sent", status: 400}
        }
    }catch(err){
        return {err, status: 400}
    }
}