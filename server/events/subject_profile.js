import {
    Review
} from "../models/subjectRelated.js"
import {
    SubjectProfile
} from '../models/subject.js'

export async function calculateSubjectProfileRating(subject_profile_id, rate, isNew){
    try{
        const MatchSubjectProfile = await SubjectProfile.findById(subject_profile_id)
        if (!MatchSubjectProfile) {console.error({invalid: "subject profile not found"})}
        const n = await Review.countDocuments()
        if (isNew){
            MatchSubjectProfile.rating = ((MatchSubjectProfile.rating * (n-1)) + rate) / n
        }else{
            MatchSubjectProfile.rating = ((MatchSubjectProfile.rating * (n+1)) - rate) / n
        }
        await MatchSubjectProfile.save()
        console.log({message: "subject profile rating updated", subject_profile_id, rating: MatchSubjectProfile.rating})
    }catch(err){
    console.error({message: "error in validating subject profile", err})
  }
}