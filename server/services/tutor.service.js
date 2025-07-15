// Modules

// Models
import Teacher from '../models/teacher.js'

// Constants

// Functions
export async function getTeacherbyId(req, res, next){
    try{
        const {tutorId} = req.body
        const teacher = await Teacher.findById(tutorId);
        if (!teacher) return res.status(404).json({warn:"cannot find teacher"})
        req.teacher = teacher
        next()
    }catch(err){
        return res.status(400).json({message:"error getting the teacher" ,err})
    }
}