import User from '../models/user.js'
import {
    compareHash,
    get_token
} from '../services/authentication.service.js'

export async function login(req, res) {
  const { email, password, type } = req.body

  const user = await User.findOne({email, __t: type})

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  if (!user.verified) {
    return res.status(403).json({ error: "Phone number is not verified" });
  }

  const match = compareHash(password, user.password)

  if (match){
    const token = get_token(user);
    
    user.last_login = new Date();
    await user.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
    
    res.status(200).json({ message: "Logged in" })
  }else{
    return res.status(400).json({ error: "Password is invalid" });
  }
}