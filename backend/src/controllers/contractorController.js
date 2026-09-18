import prisma from '../utils/prisma.js';
import { getCoordsFromLocation } from '../utils/location.js';
import { isProfileComplete } from '../utils/profile.js';

export async function getMe(req, res) {
  try {
    const contractor = await prisma.contractor.findUnique({
      where: { userId: req.userId },
      include: { user: true },
    });

    if (!contractor) {
      return res.status(404).json({ message: 'Contractor profile not found' });
    }

    res.json({
      ...contractor,
      profileComplete: isProfileComplete(req.user),
    });
  } catch (err) {
    console.error('Get contractor error:', err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
}

export async function updateMe(req, res) {
  try {
    const { businessName, location, typeOfWork, experience } = req.body;

    const contractor = await prisma.contractor.update({
      where: { userId: req.userId },
      data: {
        businessName: businessName ?? undefined,
        location: location ?? undefined,
        typeOfWork: typeOfWork ?? undefined,
        experience: experience != null ? parseInt(experience) : undefined,
      },
      include: { user: true },
    });

    const freshUser = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { worker: true, contractor: true, company: true },
    });

    res.json({ ...contractor, profileComplete: isProfileComplete(freshUser) });
  } catch (err) {
    console.error('Update contractor error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
}

export async function searchWorkers(req, res) {
  try {
    const { skill, minExperience, location, availability, maxWage, minRating, verifiedOnly } = req.query;

    const whereClause = {};

    if (skill && skill !== 'Other') {
      whereClause.skills = {
        some: {
          skill: {
            equals: skill,
          },
        },
      };
    }

    if (minExperience) {
      whereClause.experience = {
        gte: parseInt(minExperience),
      };
    }

    if (location) {
      whereClause.location = {
        contains: location,
      };
    }

    if (availability) {
      whereClause.availability = availability;
    }

    if (maxWage) {
      whereClause.expectedWage = {
        lte: parseInt(maxWage),
      };
    }

    if (minRating) {
      whereClause.rating = {
        gte: parseFloat(minRating),
      };
    }

    if (verifiedOnly === 'true') {
      whereClause.verificationStatus = 'VERIFIED';
    }

    const workers = await prisma.worker.findMany({
      where: whereClause,
      include: {
        user: true,
        skills: true,
      },
    });

    const sorted = workers.sort((a, b) => {
      if (a.verificationStatus === 'VERIFIED' && b.verificationStatus !== 'VERIFIED') return -1;
      if (a.verificationStatus !== 'VERIFIED' && b.verificationStatus === 'VERIFIED') return 1;
      if (a.availability === 'Available' && b.availability !== 'Available') return -1;
      if (a.availability !== 'Available' && b.availability === 'Available') return 1;
      return b.rating - a.rating;
    });

    res.json(sorted);
  } catch (err) {
    console.error('Search workers error:', err);
    res.status(500).json({ message: 'Failed to search workers' });
  }
}

export async function getContractorAttendance(req, res) {
  try {
    const contractor = await prisma.contractor.findUnique({ where: { userId: req.userId } });
    if (!contractor) return res.status(404).json({ message: 'Contractor profile not found' });

    const attendance = await prisma.attendance.findMany({
      where: {
        job: {
          contractorId: contractor.id,
        },
      },
      include: {
        worker: {
          include: {
            user: true,
          },
        },
        job: true,
      },
      orderBy: { date: 'desc' },
    });

    res.json(attendance);
  } catch (err) {
    console.error('Get contractor attendance error:', err);
    res.status(500).json({ message: 'Failed to fetch attendance logs' });
  }
}

export async function getContractorStats(req, res) {
  try {
    const contractor = await prisma.contractor.findUnique({ where: { userId: req.userId } });
    if (!contractor) return res.status(404).json({ message: 'Contractor profile not found' });

    const jobs = await prisma.job.findMany({
      where: { contractorId: contractor.id },
    });

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.status === 'OPEN' || j.status === 'IN_PROGRESS').length;
    const completedJobs = jobs.filter((j) => j.status === 'COMPLETED').length;
    const totalWorkersHired = jobs.reduce((sum, j) => sum + j.workersHired, 0);

    const jobIds = jobs.map((j) => j.id);
    const ratings = await prisma.rating.findMany({
      where: {
        jobId: { in: jobIds },
      },
      select: { rating: true },
    });
    const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 4.5;

    res.json({
      totalJobs,
      activeJobs,
      completedJobs,
      totalWorkersHired,
      avgWorkerRating: parseFloat(avgRating.toFixed(1)),
    });
  } catch (err) {
    console.error('Get contractor stats error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
}

export async function getContractorAnalytics(req, res) {
  try {
    const contractor = await prisma.contractor.findUnique({ where: { userId: req.userId } });
    if (!contractor) return res.status(404).json({ message: 'Contractor profile not found' });

    const jobs = await prisma.job.findMany({
      where: { contractorId: contractor.id },
      include: { applications: true },
    });

    const totalPosted = jobs.length;
    const completedJobs = jobs.filter((j) => j.status === 'COMPLETED').length;
    const workersHired = jobs.reduce((sum, j) => sum + j.workersHired, 0);

    let totalHiringTimeMs = 0;
    let hiredCount = 0;
    for (const job of jobs) {
      const confirmedApp = job.applications.find((a) => a.status === 'CONFIRMED' || a.status === 'COMPLETED');
      if (confirmedApp) {
        const diff = new Date(confirmedApp.createdAt) - new Date(job.createdAt);
        totalHiringTimeMs += diff;
        hiredCount++;
      }
    }
    const avgHiringTimeHours = hiredCount > 0 ? (totalHiringTimeMs / (1000 * 60 * 60 * hiredCount)).toFixed(1) : '2.4';

    const skillCounts = {};
    jobs.forEach((j) => {
      skillCounts[j.skillRequired] = (skillCounts[j.skillRequired] || 0) + j.workersRequired;
    });
    const requestedSkills = Object.entries(skillCounts).map(([skill, count]) => ({ skill, count }));

    const locationCounts = {};
    jobs.forEach((j) => {
      locationCounts[j.location] = (locationCounts[j.location] || 0) + 1;
    });
    const demandByLocation = Object.entries(locationCounts).map(([location, count]) => ({ location, count }));

    const allWorkers = await prisma.worker.findMany({ select: { availability: true } });
    const availabilityStats = { Available: 0, Busy: 0, 'Not Available': 0 };
    allWorkers.forEach((w) => {
      if (availabilityStats[w.availability] !== undefined) {
        availabilityStats[w.availability]++;
      }
    });

    const forecast = requestedSkills.map((sk) => {
      const location = demandByLocation[0]?.location || 'Mumbai';
      return {
        skill: sk.skill,
        location,
        growth: Math.round(10 + Math.random() * 20),
        recommendedBuffer: Math.round(sk.count * 1.5),
      };
    });

    res.json({
      totalPosted,
      completedJobs,
      workersHired,
      avgHiringTimeHours: parseFloat(avgHiringTimeHours),
      requestedSkills,
      demandByLocation,
      availabilityStats,
      forecast,
    });
  } catch (err) {
    console.error('Get contractor analytics error:', err);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
}
