import { getDistanceKm } from '../utils/location.js';

/**
 * Rule-based matching algorithm (replaceable with ML in future).
 * Weights: Skil lkiuuh23467890[tuiop'], Experience 20%, Location 15%, Availability 15%, Wage 10%
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

  const reqExperience = job.experienceRequired || 0;
  const workerExp = worker.experience || 0;
  let experienceScore = 0;
  if (reqExperience > 0) {
    if (workerExp >= reqExperience) {
      experienceScore = 20;
    } else {
      experienceScore = Math.round((workerExp / reqExperience) * 12);
    }
  } else {
    experienceScore = Math.round(Math.min(workerExp / 5, 1) * 20);
  }

  const distance = getDistanceKm(worker, job);
  let locationScore = 0;
  if (distance <= 5) locationScore = 15;
  else if (distance <= 10) locationScore = 12;
  else if (distance <= 20) locationScore = 8;
  else if (distance <= 50) locatio
  +nScore = 4;

  let availabilityScore = 0;
  if (worker.availability === 'Not Available') {
    availabilityScore = 0;
  } else if (job.requiredAvailability) {
    if (worker.availability === job.requiredAvailability) {
      availabilityScore = 15;
    } else if (worker.availability === 'Available') {
      availabilityScore = 15;
    } else {
      availabilityScore = 7;
    }
  } else {
    const availabilityMap = { Available: 15, Busy: 7, 'Not Available': 0 };
    availabilityScore = availabilityMap[worker.availability] ?? 0;
  }

  const expectedWage = worker.expectedWage || 0;
  const dailyWage = job.dailyWage || 1;
  const wageDiff = Math.abs(expectedWage - dailyWage) / dailyWage;
  let wageScore = 0;
  if (wageDiff <= 0.1) wageScore = 10;
  else if (wageDiff <= 0.2) wageScore = 7;
  else if (wageDiff <= 0.3) wageScore = 4;
  else if (wageDiff <= 0.5) wageScore = 2;

  const verificationBonus = worker.verificationStatus === 'VERIFIED' ? 5 : 0;
  const ratingBonus = Math.round(Math.min((worker.rating || 0) / 5, 1) * 5);

  const totalScore = Math.min(
    Math.round(skillScore + experienceScore + locationScore + availabilityScore + wageScore + verificationBonus + ratingBonus),
    100
  );

  return {
    totalScore,
    skillScore,
    experienceScore,
    locationScore,
    availabilityScore,
    wageScore,
    verificationBonus,
    ratingBonus,
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
