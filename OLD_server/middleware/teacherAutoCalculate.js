import { SubjectProfile } from './subjectProfile.model.js';

TeacherSchema.pre('save', async function (next) {
  if (!this.isModified('subject_profiles')) return next();

  try {
    const profiles = await SubjectProfile.find({
      _id: { $in: this.subject_profiles }
    }).select('yearsExp grades languages sectors education_system rating');

    let total = 0;
    let ratingSum = 0;
    let ratingCount = 0;
    const allGrades = new Set();
    const allLanguages = new Set();
    const allSectors = new Set();
    const systems = new Set();

    for (const profile of profiles) {
      total += profile.yearsExp || 0;

      (profile.grades || []).forEach(g => allGrades.add(g));
      (profile.languages || []).forEach(l => allLanguages.add(l));
      (profile.sectors || []).forEach(s => allSectors.add(s));
      if (profile.education_system) systems.add(profile.education_system);

      if (typeof profile.rating === 'number') {
        ratingSum += profile.rating;
        ratingCount++;
      }
    }

    this.experience_years = total;
    this.grades = Array.from(allGrades);
    this.languages = Array.from(allLanguages);
    this.sectors = Array.from(allSectors);
    this.education_system = Array.from(systems);
    this.rating = ratingCount > 0 ? ratingSum / ratingCount : 0;

    next();
  } catch (err) {
    next(err);
  }
});

TeacherSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (!update?.subject_profiles) return next();

  try {
    const profiles = await SubjectProfile.find({
      _id: { $in: update.subject_profiles }
    }).select('yearsExp grades languages sectors education_system rating');

    let total = 0;
    let ratingSum = 0;
    let ratingCount = 0;
    const allGrades = new Set();
    const allLanguages = new Set();
    const allSectors = new Set();
    const systems = new Set();

    for (const profile of profiles) {
      total += profile.yearsExp || 0;

      (profile.grades || []).forEach(g => allGrades.add(g));
      (profile.languages || []).forEach(l => allLanguages.add(l));
      (profile.sectors || []).forEach(s => allSectors.add(s));
      if (profile.education_system) systems.add(profile.education_system);

      if (typeof profile.rating === 'number') {
        ratingSum += profile.rating;
        ratingCount++;
      }
    }

    update.experience_years = total;
    update.grades = Array.from(allGrades);
    update.languages = Array.from(allLanguages);
    update.sectors = Array.from(allSectors);
    update.education_system = Array.from(systems);
    update.rating = ratingCount > 0 ? ratingSum / ratingCount : 0;

    this.setUpdate(update);
    next();
  } catch (err) {
    next(err);
  }
});