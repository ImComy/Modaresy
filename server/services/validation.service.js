import {isEmail, isMobilePhone} from 'validator'
import {
    Governates,
    Districts,
    EducationStructure
} from '../models/constants.js'

export function validatePhoneNumber(num) {
  return isMobilePhone(num, 'ar-EG');
}

export function validateDistrict(district, governate){
    if (!district || !governate) return false;
    const gov = governate.trim();
    const dist = district.trim();

    return Districts[gov] && Districts[gov].includes(dist);
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
  sector = sector.trim()
  return EducationStructure[educationSystem].sectors[grade].includes(sector);
}

export {isEmail}

