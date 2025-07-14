import Student from '../models/student.js'
import Teacher from '../models/teacher.js'

import {
  get_token,
  compareHash
} from '../services/authentication.service.js'

export async function createAccount(req, res, next) {
  try{
    const user_data = req.body

    let user;
    if (user_data.type === "Student") {
      user = new Student(user_data);
    }else if (user_data.type === "Teacher") {
      user = new Teacher(user_data);
    }else {
      return res.status(400).json({ error: "Invalid user type" });
    }
    await user.save();
    
    return res.status(201).json({ message: "Account created!" });
  }catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function login(req, res){
  const input_data = req.body

  const {isMatch, id} = await compareHash(input_data.password, input_data.email);
  if (!isMatch) return res.status(400).json({error: "password or email is invalid"})
  
  const token = await get_token(id)
  if (!token) return res.status(400).json({error: "cannot generate a token!"});

  return res.status(200).json({message: "user login successfully!", token})
}
