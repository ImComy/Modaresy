import {
    getProfileData,
    whatsappContactAPI
} from '../services/student.service.js'

// All function here requires middleware "verifyToken" to run

export const addToWishlist = async (req, res) => {
  try {
    const { tutorId } = req.body;
    const wishlist = req.user.wishlist;

    if (wishlist.teacher_ids.includes(tutorId))
      return res.status(400).json({ error: "Tutor is already in the wishlist" });

    wishlist.teacher_ids.push(tutorId);
    
    await wishlist.save();
    res.status(200).json({ message: "Tutor added to wishlist" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add tutor to wishlist", details: err.message });
  }
};

export const removeFromWishlist = async(req, res) => {
  try {
    const { tutorId } = req.body;
    const wishlist = req.user.wishlist;

    if (!wishlist.teacher_ids.includes(tutorId))
      return res.status(400).json({ error: "Tutor doesn't exist in the wishlist" });

    const index = wishlist.teacher_ids.indexOf(tutorId)
    wishlist.teacher_ids.splice(index, 1)
    
    await wishlist.save();
    res.status(200).json({ message: "Tutor removed from wishlist" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove tutor from wishlist", details: err.message });
  }
}

export async function getProfile(req, res){
    res.status(200).json({userdata: getProfileData(req.user)})
}

export async function updateProfile(req, res) {
    try {
        const { updated_information } = req.body
        Object.assign(req.user, updated_information);
        await req.user.save()
        res.status(200).json({ message: "Profile updated" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// requires "getTeacherById"
export async function contactTutor(req, res){
    try{
        res.status(200).json({link: whatsappContactAPI(req.teacher.phone_number, 
            `Hello! I'm ${req.user.name}, I am interested about knowing your groups and teaching details, Mr/Ms ${req.teacher.name}`)})
    }catch(err){
        res.status(400).json({ error: err.message });
    }    
}