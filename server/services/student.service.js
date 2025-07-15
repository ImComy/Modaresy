// Modules

// Models
import Student from '../models/student.js'
import Wishlist from '../models/misc.js'

// Constants

// Functions
export async function getWishlist(req, res, next){
    try{
        const wishlist = await Wishlist.findById(req.user.wishlist_id);
        req.user.wishlist = wishlist
        next()
    }catch(err){
        return res.status(404).json({ error: "Wishlist not found" });
    }
}

export async function getProfileData(user){
    const filtered_user = user.toObject()

    delete filtered_user.password
    delete filtered_user.verificationCode;
    delete filtered_user.codeExpiresAt;
    delete filtered_user.last_login;
    delete filtered_user.wishlist_id;

    return filtered_user
}

export const whatsappContactAPI = (phoneNumber, text) =>
  `https://api.whatsapp.com/send?phone=2${phoneNumber}&text=${encodeURIComponent(text)}`;
