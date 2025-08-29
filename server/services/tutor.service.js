import { Teacher, Enrollment, EnrollmentRequest } from '../models/teacher.js';
import { Subject } from '../models/subject.js';
import { PersonalAvailability } from '../models/misc.js';

export async function getTeacherbyId(req, res, next) {
    try {
        const { tutorId } = req.params;
        if (!tutorId) return res.status(400).json({ error: "tutorId is required" });
        
        const teacher = await Teacher.findById(tutorId);
        if (!teacher) return res.status(404).json({ error: "Teacher not found" });
        
        req.teacher = teacher;
        next();
    } catch (err) {
        res.status(500).json({ error: "Error fetching teacher" });
    }
}

export function isTeacher(req, res, next) {
    if (req.user?.type === "Teacher") return next();
    res.status(403).json({ error: "Teacher access required" });
}


export async function enrollStudent(student, teacher) {
  try {
    if (!student || !teacher) {
      return { error: 'student and teacher are required' };
    }

    const enrollment = new Enrollment({
      studentId: student._id,
      tutorId: teacher._id,
      status: 'accepted',
    });

    await enrollment.save();

    await Teacher.findByIdAndUpdate(teacher._id, {
      $push: { enrollments: enrollment._id },
    });

    return { message: 'Enrollment successful', enrollmentId: enrollment._id };
  } catch (err) {
    console.error('enrollStudent error:', err);
    return { error: 'Error enrolling student' };
  }
}

export async function createNewTutor(req, res) {
  try {
    console.log('createNewTutor called');
    const { name, email, password, address, about_me } = req.body || {};

    console.log('Received tutor data:', { name, email, address });

    const requiredFields = ['name', 'email', 'password'];
    const missingFields = requiredFields.filter((field) => !req.body?.[field]);

    if (missingFields.length > 0) {
      console.log(`Missing required fields: ${missingFields.join(', ')}`);
      if (res) return res.status(400).json({ error: 'Missing required fields', missingFields });
      throw new Error('Missing required fields: ' + missingFields.join(', '));
    }

    const existingTutor = await Teacher.findOne({ email });
    if (existingTutor) {
      console.log('Error: Email already exists');
      if (res) return res.status(400).json({ error: 'Email already exists' });
      return { error: 'Email already exists' };
    }

    const defaultAvailability = new PersonalAvailability({});
    await defaultAvailability.save();

    const newTutor = new Teacher({
      name,
      email,
      password,
      address,
      about_me,
      availability: defaultAvailability._id,
    });

    await newTutor.save();

    console.log(`New tutor created with ID: ${newTutor._id}`);

    if (res) {
      return res.status(201).json({ message: 'Tutor created successfully', tutor: newTutor });
    }
    return { message: 'Tutor created successfully', tutor: newTutor };
  } catch (err) {
    console.error('Error in createNewTutor:', err);
    if (res) return res.status(500).json({ error: 'Internal server error: ' + err.message });
    throw err;
  }
}

export async function filterTutors(filters) {
  const {
    educationSystem,
    grade,
    subject,
    language,
    sector,
    governate,
    district,
    minRating,
    minPrice,
    maxPrice,
  } = filters || {};

  try {
    const pipeline = [];
    const teacherMatch = {};
    if (governate) teacherMatch.governate = governate;
    if (district) teacherMatch.district = district;
    if (minRating != null && !Number.isNaN(minRating)) teacherMatch.rating = { $gte: Number(minRating) };
    if (Object.keys(teacherMatch).length) pipeline.push({ $match: teacherMatch });

    pipeline.push({
      $lookup: {
        from: 'subjectprofiles',
        localField: 'subject_profiles',
        foreignField: '_id',
        as: 'subject_profiles'
      }
    });
    pipeline.push({ $unwind: { path: '$subject_profiles', preserveNullAndEmptyArrays: false } });

    pipeline.push({
      $lookup: {
        from: 'subjects',
        localField: 'subject_profiles.subject_id',
        foreignField: '_id',
        as: 'subject_doc'
      }
    });
    pipeline.push({ $unwind: { path: '$subject_doc', preserveNullAndEmptyArrays: false } });

    const profileMatch = {};
    if (educationSystem) profileMatch['subject_doc.education_system'] = educationSystem;
    if (grade) profileMatch['subject_doc.grade'] = grade;
    if (subject) profileMatch['subject_doc.name'] = subject;
    if (language) profileMatch['subject_doc.language'] = language;
    if (sector) profileMatch['subject_doc.sector'] = sector;

    if (minPrice != null || maxPrice != null) {
      const priceClauses = [];
      if (minPrice != null) {
        priceClauses.push({ 'subject_profiles.private_pricing.price': { $gte: Number(minPrice) } });
        priceClauses.push({ 'subject_profiles.group_pricing.price': { $gte: Number(minPrice) } });
      }
      if (maxPrice != null) {
        priceClauses.push({ 'subject_profiles.private_pricing.price': { $lte: Number(maxPrice) } });
        priceClauses.push({ 'subject_profiles.group_pricing.price': { $lte: Number(maxPrice) } });
      }
      if (priceClauses.length) {
        profileMatch.$and = profileMatch.$and || [];
        profileMatch.$and.push({ $or: priceClauses });
      }
    }

    if (Object.keys(profileMatch).length) pipeline.push({ $match: profileMatch });

    if (minRating != null && !Number.isNaN(minRating)) {
      pipeline.push({ $match: { 'subject_profiles.rating': { $gte: Number(minRating) } } });
    }

    pipeline.push({
      $group: {
        _id: '$_id',
        doc: { $first: '$$ROOT' },
        matchedProfiles: { $push: { $mergeObjects: [ '$subject_profiles', { subject_doc: '$subject_doc' } ] } }
      }
    });

    pipeline.push({
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ['$doc', { subject_profiles: '$matchedProfiles' }]
        }
      }
    });

    pipeline.push({
      $addFields: {
        coordinates: {
          $cond: [
            { $ifNull: ['$location_coordinates', false] },
            {
              latitude: '$location_coordinates.latitude',
              longitude: '$location_coordinates.longitude'
            },
            null
          ]
        }
      }
    });

    pipeline.push({ $project: { password: 0, __v: 0, 'subject_profiles.__v': 0 } });

    const results = await Teacher.aggregate(pipeline).exec();
    return results;
  } catch (err) {
    console.error('filterTutors error:', err);
    throw new Error(`Filter error: ${err.message}`);
  }
}

export async function recommendTutorsForStudent(student, { q, page = 1, limit = 30 } = {}) {
  try {
    const studentEdu = student.education_system;
    const studentGrade = student.grade;
    const studentSector = student.sector;
    const governate = student.governate;

    const pipeline = [];

    pipeline.push({
      $lookup: {
        from: 'subjectprofiles',
        localField: 'subject_profiles',
        foreignField: '_id',
        as: 'subject_profiles'
      }
    });
    pipeline.push({ $unwind: { path: '$subject_profiles', preserveNullAndEmptyArrays: true } });

    pipeline.push({
      $lookup: {
        from: 'subjects',
        localField: 'subject_profiles.subject_id',
        foreignField: '_id',
        as: 'subject_doc'
      }
    });
    pipeline.push({ $unwind: { path: '$subject_doc', preserveNullAndEmptyArrays: true } });

    pipeline.push({
      $addFields: {
        matchSubject: { $cond: [ { $eq: ['$subject_doc.grade', studentGrade] }, 2, 0 ] },
        matchEdu: { $cond: [ { $eq: ['$subject_doc.education_system', studentEdu] }, 2, 0 ] },
        matchSector: { $cond: [ { $eq: ['$subject_doc.sector', studentSector] }, 1, 0 ] },
        profileRatingScore: { $cond: [ { $ifNull: ['$subject_profiles.rating', false] }, '$subject_profiles.rating', 0 ] },
      }
    });

    pipeline.push({
      $group: {
        _id: '$_id',
        doc: { $first: '$$ROOT' },
        totalScore: { $sum: { $add: [ '$matchSubject', '$matchEdu', '$matchSector', '$profileRatingScore' ] } },
        subject_profiles: { $push: { $mergeObjects: [ '$subject_profiles', { subject_doc: '$subject_doc' } ] } }
      }
    });

    pipeline.push({ $replaceRoot: { newRoot: { $mergeObjects: ['$doc', { score: '$totalScore', subject_profiles: '$subject_profiles' }] } } });

    if (governate) pipeline.push({ $addFields: { locationBoost: { $cond: [ { $eq: ['$governate', governate] }, 1, 0 ] } } });
    pipeline.push({ $addFields: { finalScore: { $add: [ '$score', { $ifNull: ['$locationBoost', 0] }, '$rating' ] } } });

    pipeline.push({
      $addFields: {
        coordinates: {
          $cond: [
            { $ifNull: ['$location_coordinates', false] },
            {
              latitude: '$location_coordinates.latitude',
              longitude: '$location_coordinates.longitude'
            },
            null
          ]
        }
      }
    });

    pipeline.push({ $sort: { finalScore: -1, rating: -1 } });

    const skip = Math.max(0, (page - 1) * limit);
    pipeline.push({ $skip: skip }, { $limit: limit }, { $project: { password: 0, __v: 0, 'subject_profiles.__v': 0 } });

    const tutors = await Teacher.aggregate(pipeline).exec();
    const total = await Teacher.countDocuments();
    return { tutors, total };
  } catch (err) {
    console.error('recommendTutorsForStudent error:', err);
    throw new Error('recommend error: ' + err.message);
  }
}

