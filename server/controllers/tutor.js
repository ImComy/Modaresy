import {
  getProfileData
} from '../services/authentication.service.js'

export async function getProfile(req, res){    
    return res.status(200).json({userdata: getProfileData(req.user)})
}

export async function updateProfile(req, res) {
    try {
        const { updated_information } = req.body
        Object.assign(req.user, updated_information);
        await req.user.save()
        return res.status(200).json({ message: "Profile updated" });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}