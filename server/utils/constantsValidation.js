import {
  SubjectsBySystem,
  Languages,
  Governates,
  User_Types,
  PaymentTiming,
  PaymentMethods,
  PricePeriod 
} from "../models/constants.js"; 

export const validatePaymentMethod = (method) => PaymentMethods.includes(method);
export const validatePaymentTiming = (timing) => PaymentTiming.includes(timing);
export const validatePricePeriod = (period) => PricePeriod.includes(period);

const Education_Systems = Object.keys(SubjectsBySystem);
const EducationStructure = Object.fromEntries(
  Object.entries(SubjectsBySystem).map(([system, grades]) => [
    system,
    {
      grades: Object.keys(grades),
      sectors: Object.fromEntries(
        Object.entries(grades).map(([grade, subjects]) => [
          grade,
          Array.isArray(subjects) ? [] : Object.keys(subjects)
        ])
      )
    }
  ])
);

export const validateEducationSystem = (system) => Education_Systems.includes(system);

export const validateGrade = (system, grade) => {
  return EducationStructure?.[system]?.grades?.includes(grade);
};

export const validateSector = (system, grade, sector) => {
  const sectors = EducationStructure?.[system]?.sectors?.[grade];
  return Array.isArray(sectors) && sectors.includes(sector);
};

export const validateSubject = (system, grade, subject, sector = null) => {
  const subjects = SubjectsBySystem?.[system]?.[grade];
  if (!subjects) return false;

  if (Array.isArray(subjects)) return subjects.includes(subject);
  if (sector && subjects?.[sector]) return subjects[sector].includes(subject);
  
  return false;
};

export const validateLanguage = (language) => {
  return Languages.includes(language);
};

export const validateGovernate = (governate) => {
  return Governates.includes(governate);
};

export const validateUserType = (userType) => {
  return User_Types.includes(userType);
};