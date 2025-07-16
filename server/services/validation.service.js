import {isEmail, isMobilePhone} from 'validator'
import {
    Districts,
    EducationStructure
} from '../models/constants.js'
import {
  SubjectProfile
} from '../models/subject.js'

export function validatePhoneNumber(num) {
  return isMobilePhone(num, 'ar-EG');
}

export function validateDistrict(district, governate){
    if (!district || !governate) return false;

    return Districts[governate] && Districts[governate].includes(district);
}

export function validateEducationStructure_many(property_name, property_array, educationSystem){
  if (!EducationStructure[educationSystem]) return false;

  return property_array.every(property => EducationStructure[educationSystem][property_name].includes(property))
}
export function validateEducationStructure_one(property_name, property_value, educationSystem){
  if (!EducationStructure[educationSystem]) return false;

  return EducationStructure[educationSystem][property_name].includes(property_value);
}

export function validateSector(sector, grade, educationSystem){
  if (!EducationStructure[educationSystem] || !EducationStructure[educationSystem].grades.includes(grade)) return false;
  return EducationStructure[educationSystem].sectors[grade].includes(sector);
}

export async function validateSubjectProfile(req, res){
  try{
    const {subject_profile_id} = req.body || req.params
    const MatchSubjectProfile = await SubjectProfile.findById(subject_profile_id)
    if (!MatchSubjectProfile) {return res.status(400).json({invalid: "subject profile not found"})}
    req.populated_subjectProfile = MatchSubjectProfile
    next()
  }catch(err){
    return res.status(400).json({message: "error in validating subject profile", err})
  }
}

export {isEmail}

