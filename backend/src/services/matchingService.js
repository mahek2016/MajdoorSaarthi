import { getDistanceKm } from '../utils/location.js';

/**
 * Rule-based matching algorithm (replaceable with ML in future).
 * Weights: Skill 40%, Experience 20%, Location 15%, Availability 15%, Wage 10%
 */
export function calculateMatchScore(worker, job) {
  const workerSkills = (worker.skills || []).map((s) =>
    (typeof s === 'string' ? s : s.skill).toLowerCase()
  );
  const requiredSkill = job.skillRequired?.toLowerCase() || '';
  const skillMatch =
    workerSkills.includes(requiredSkill) ||
    workerSkills.some((s) => s.includes(requiredSkill) || requiredSkill.includes(s));
  const skillScore = skillMatch ? 40 : 0;

  const experienceYears = worker.experience || 0;
  const experienceScore = Math.round(Math.min(experienceYears / 5, 1) * 20);

  const distance = getDistanceKm(worker, job);
  let locationScore = 0;
  if (distance <= 5) locationScore = 15;
  else if (distance <= 10) locationScore = 12;
  else if (distance <= 20) locationScore = 8;
  else if (distance <= 50) locationScore = 4;

  const availabilityMap = { Available: 15, Busy: 7, 'Not Available': 0 };
  const availabilityScore = availabilityMap[worker.availability] ?? 0;

  const expectedWage = worker.expectedWage || 0;
  const dailyWage = job.dailyWage || 1;
  const wageDiff = Math.abs(expectedWage - dailyWage) / dailyWage;
  let wageScore = 0;
  if (wageDiff <= 0.1) wageScore = 10;
  else if (wageDiff <= 0.2) wageScore = 7;
  else if (wageDiff <= 0.3) wageScore = 4;
  else if (wageDiff <= 0.5) wageScore = 2;

  const totalScore = skillScore + experienceScore + locationScore + availabilityScore + wageScore;

  return {
    totalScore: Math.round(totalScore),
    skillScore,
    experienceScore,
    locationScore,
    availabilityScore,
    wageScore,
    distance,
  };
}

export function rankWorkersForJob(workers, job) {
  return workers
    .map((worker) => {
      const match = calculateMatchScore(worker, job);
      return {
        ...worker,
        matchScore: match.totalScore,
        matchBreakdown: {
          skillScore: match.skillScore,
          experienceScore: match.experienceScore,
          locationScore: match.locationScore,
          availabilityScore: match.availabilityScore,
          wageScore: match.wageScore,
        },
        distance: match.distance,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function rankJobsForWorker(worker, jobs) {
  return jobs
    .map((job) => {
      const match = calculateMatchScore(worker, job);
      return {
        ...job,
        matchScore: match.totalScore,
        matchBreakdown: {
          skillScore: match.skillScore,
          experienceScore: match.experienceScore,
          locationScore: match.locationScore,
          availabilityScore: match.availabilityScore,
          wageScore: match.wageScore,
        },
        distance: match.distance,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
