import {
    Review
} from "../models/subjectRelated.js"
import {
    SubjectProfile
} from '../models/subject.js'

export async function calculateSubjectProfileRating(subject_profile_id){
    try{
        const MatchSubjectProfile = await SubjectProfile.findById(subject_profile_id)
        if (!MatchSubjectProfile) {console.error({invalid: "subject profile not found"})}
        //MatchSubjectProfile.rating = await calculateRating(MatchSubjectProfile)
    }catch(err){
    console.error({message: "error in validating subject profile", err})
  }    
}