import { Teacher, Enrollment, EnrollmentRequest } from '../models/teacher.js';
import { Subject } from '../models/subject.js';
import { PersonalAvailability } from '../models/misc.js';

/**
 * Middleware - attach teacher to req
 */
export async function getTeacherbyId(req, res, next) {
  try {
    const { tutorId } = req.params;
    if (!tutorId) return res.status(400).json({ error: "tutorId is required" });

    const teacher = await Teacher.findById(tutorId);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    req.teacher = teacher;
    next();
  } catch (err) {
    console.error('getTeacherbyId error:', err);
    res.status(500).json({ error: "Error fetching teacher" });
  }
}

export function isTeacher(req, res, next) {
  if (req.user?.type === "Teacher") return next();
  res.status(403).json({ error: "Teacher access required" });
}

/**
 * Enroll student to teacher
 */
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

/**
 * Create new tutor
 */
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

/**
 * Normalize filter input: allow string or array for language/sector
 */
function normalizeFilterInput(val) {
  if (val == null) return null;
  if (Array.isArray(val)) return val.map(v => String(v).trim()).filter(Boolean);
  if (typeof val === 'string') return [val.trim()];
  // other types -> attempt to stringify
  return [String(val)];
}

/**
 * filterTutors: aggregation pipeline with correct handling of array fields (language/sector)
 */
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

    // Prepare normalized filters for language/sector
    const languageArray = normalizeFilterInput(language); // null | ['Arabic'] | ['Arabic','English']
    const sectorArray = normalizeFilterInput(sector);

    // Lookup subject_profiles and subjects
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

    // Build profile match based on provided filters
    const profileMatch = {};
    if (educationSystem) profileMatch['subject_doc.education_system'] = educationSystem;
    if (grade) profileMatch['subject_doc.grade'] = grade;
    if (subject) profileMatch['subject_doc.name'] = subject;

    // language: if client passed array -> $all, else exact match against array elements works by using the value directly
    if (languageArray && languageArray.length > 0) {
      if (languageArray.length === 1) {
        profileMatch['subject_doc.language'] = languageArray[0]; // matches if array contains this value
      } else {
        profileMatch['subject_doc.language'] = { $all: languageArray }; // subject_doc.language must contain all items
      }
    }

    // sector: same logic as language
    if (sectorArray && sectorArray.length > 0) {
      if (sectorArray.length === 1) {
        profileMatch['subject_doc.sector'] = sectorArray[0];
      } else {
        profileMatch['subject_doc.sector'] = { $all: sectorArray };
      }
    }

    // price filtering (subject_profiles private/group pricing)
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

    // Group back teacher docs and attach matchedProfiles
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

    // add coordinates convenience field
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

    // remove sensitive/internal fields
    pipeline.push({ $project: { password: 0, __v: 0, 'subject_profiles.__v': 0 } });

    const results = await Teacher.aggregate(pipeline).exec();
    return results;
  } catch (err) {
    console.error('filterTutors error:', err);
    throw new Error(`Filter error: ${err.message}`);
  }
}

// services/recommendation.service.js (or wherever you keep it)
export async function recommendTutorsForStudent(student, { q = '', page = 1, limit = 30 } = {}) {
  try {
    const studentEdu = student.education_system || null;
    const studentGrade = student.grade || null;
    const studentSector = student.sector || null;
    const governate = student.governate || null;

    const studentSectorArr = studentSector
      ? (Array.isArray(studentSector) ? studentSector : [studentSector])
      : null;

    const skip = Math.max(0, (page - 1) * limit);

    // Start pipeline
    const pipeline = [];

    // 1) Optional name search (apply early to reduce work)
    if (q && typeof q === 'string' && q.trim().length > 0) {
      pipeline.push({
        $match: { name: { $regex: q.trim(), $options: 'i' } } // case-insensitive contains
      });
    }

    // 2) Lookup subject_profiles and subject_docs (same as your code)
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

    // 3) Normalize subject_doc.sector to array
    pipeline.push({
      $addFields: {
        subjectSectorArray: {
          $cond: [
            { $isArray: '$subject_doc.sector' },
            '$subject_doc.sector',
            { $cond: [{ $ifNull: ['$subject_doc.sector', false] }, ['$subject_doc.sector'], []] }
          ]
        }
      }
    });

    // 4) Compute match pieces (use numeric scores; keep as consistent as possible)
    const matchSectorExpr = studentSectorArr
      ? {
          $cond: [
            {
              $gt: [
                { $size: { $setIntersection: [studentSectorArr, '$subjectSectorArray'] } },
                0
              ]
            },
            1,
            0
          ]
        }
      : 0;

    pipeline.push({
      $addFields: {
        matchSubject: studentGrade ? { $cond: [{ $eq: ['$subject_doc.grade', studentGrade] }, 2, 0] } : 0,
        matchEdu: studentEdu ? { $cond: [{ $eq: ['$subject_doc.education_system', studentEdu] }, 2, 0] } : 0,
        matchSector: matchSectorExpr,
        profileRatingScore: { $ifNull: ['$subject_profiles.rating', 0] }
      }
    });

    // 5) group back to one document per tutor, summing scores
    pipeline.push({
      $group: {
        _id: '$_id',
        doc: { $first: '$$ROOT' }, // pick first representative doc fields
        totalScore: {
          $sum: { $add: ['$matchSubject', '$matchEdu', '$matchSector', '$profileRatingScore'] }
        },
        subject_profiles: {
          $push: { $mergeObjects: ['$subject_profiles', { subject_doc: '$subject_doc' }] }
        }
      }
    });

    // 6) rebuild document: merge original doc with computed score and subject_profiles array
    pipeline.push({
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            '$doc',
            { score: '$totalScore', subject_profiles: '$subject_profiles' }
          ]
        }
      }
    });

    // 7) optional location boost
    if (governate) {
      pipeline.push({
        $addFields: {
          locationBoost: { $cond: [{ $eq: ['$governate', governate] }, 1, 0] }
        }
      });
    }

    // 8) finalScore (use rating fallback 0). Make sure fields exist and numeric.
    pipeline.push({
      $addFields: {
        finalScore: { $add: ['$score', { $ifNull: ['$locationBoost', 0] }, { $ifNull: ['$rating', 0] }] }
      }
    });

    // 9) standardize coordinates
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

    // 10) stable sort: finalScore desc, rating desc, then tie-breaker _id asc (stable ordering)
    pipeline.push({ $sort: { finalScore: -1, rating: -1, _id: 1 } });

    // 11) Use $facet to compute total distinct count and to page results in a single aggregation.
    const facetPipeline = [
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            { $project: { password: 0, __v: 0, 'subject_profiles.__v': 0 } }
          ],
          total: [
            { $count: 'count' }
          ]
        }
      }
    ];

    const agg = await Teacher.aggregate([...pipeline, ...facetPipeline]).exec();

    // normalize result
    const data = (agg && agg[0] && Array.isArray(agg[0].data)) ? agg[0].data : [];
    const total = (agg && agg[0] && Array.isArray(agg[0].total) && agg[0].total[0] && agg[0].total[0].count)
      ? agg[0].total[0].count
      : 0;

    // Optional: convert _id to string id (makes frontend logic simpler)
    const tutors = data.map(t => ({ ...t, id: t._id ? String(t._id) : (t.id || undefined) }));

    // Debug: log pagination info to help diagnose missing pages
    try {
      console.debug(`[recommendTutorsForStudent] q="${q}", page=${page}, limit=${limit}, skip=${skip}, returned=${tutors.length}, total=${total}`);
    } catch (e) {
      // ignore logging errors
    }

    return { tutors, total };
  } catch (err) {
    console.error('recommendTutorsForStudent error:', err);
    throw new Error('recommend error: ' + (err.message || err));
  }
}


