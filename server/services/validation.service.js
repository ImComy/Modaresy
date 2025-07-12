import {isEmail, isMobilePhone} from 'validator'
import {
    Governates,
    Districts
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

export {isEmail}

