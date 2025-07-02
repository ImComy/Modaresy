import {
  Education_Systems,
  EducationStructure,
  SubjectsBySystem,
  Languages,
  Governates
} from "@/constants/education"; 

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
