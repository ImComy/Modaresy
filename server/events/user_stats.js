import Student from '../models/student.js';
import { Teacher } from '../models/teacher.js';

let cachedStats = null;
let lastCachedAt = 0;
const ONE_DAY_MS = 24 * 60 * 60 * 1000; 

export function getCachedUserStats() {
  return cachedStats;
}

export async function calculateUserStats() {
  try {
    const [studentCount, teacherCount] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments()
    ]);

    const districtAggregation = await Teacher.aggregate([
      { $match: { district: { $exists: true, $ne: null } } },
      { $group: { _id: "$district" } },
      { $count: "totalDistricts" }
    ]);

    const totalDistricts = districtAggregation[0]?.totalDistricts || 0;

    const stats = { studentCount, teacherCount, totalDistricts };
    cachedStats = stats;
    lastCachedAt = Date.now();

    console.log("User stats calculated and cached:", stats);
    return stats;
  } catch (err) {
    console.error("Failed to calculate user stats:", err);
    throw err;
  }
}

export async function initializeUserStatsCache() {
  try {
    await calculateUserStats();
  } catch (err) {
    console.error("Initial stats calculation failed, retrying in 1 minute.");
    setTimeout(initializeUserStatsCache, 60 * 1000);
    return;
  }

  setInterval(async () => {
    try {
      await calculateUserStats();
    } catch (err) {
      console.error("Scheduled stats update failed:", err);
    }
  }, ONE_DAY_MS);
}
