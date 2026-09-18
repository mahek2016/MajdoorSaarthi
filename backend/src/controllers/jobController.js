import prisma from '../utils/prisma.js';
import { getCoordsFromLocation } from '../utils/location.js';
import { rankWorkersForJob, calculateMatchScore } from '../services/matchingService.js';
import { isProfileComplete } from '../utils/profile.js';

export async function createJob(req, res) {
  try {
    const contractor = await prisma.contractor.findUnique({ where: { userId: req.userId } });
    if (!contractor) {
      return res.status(404).json({ message: 'Contractor profile not found' });
    }

    const {
      title, skillRequired, workersRequired, location,
      dailyWage, duration, startDate, description,
      experienceRequired, requiredAvailability,
    } = req.body;

    const coords = getCoordsFromLocation(location);

    const job = await prisma.job.create({
      data: {
        contractorId: contractor.id,
        title,
        skillRequired,
        workersRequired: parseInt(workersRequired),
        location,
        dailyWage: parseInt(dailyWage),
        duration: parseInt(duration),
        startDate: new Date(startDate),
        description,
        latitude: coords.lat,
        longitude: coords.lng,
        experienceRequired: parseInt(experienceRequired || 0),
        requiredAvailability: requiredAvailability || 'Available',
      },
    });

    res.status(201).json(job);
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({ message: 'Failed to create job' });
  }
}

export async function getMyJobs(req, res) {
  try {
    const contractor = await prisma.contractor.findUnique({ where: { userId: req.userId } });
    if (!contractor) {
      return res.status(404).json({ message: 'Contractor profile not found' });
    }

    const jobs = await prisma.job.findMany({
      where: { contractorId: contractor.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(jobs);
  } catch (err) {
    console.error('Get my jobs error:', err);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
}

export async function getSuggestedWorkers(req, res) {
  try {
    const jobId = parseInt(req.params.id);
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { contractor: true },
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const workers = await prisma.worker.findMany({
      include: { user: true, skills: true },
    });

    const ranked = rankWorkersForJob(workers, job);
    
    // Lookup applications for this job
    const applications = await prisma.application.findMany({
      where: { jobId },
    });

    const mapped = ranked.map((w) => {
      const app = applications.find((a) => a.workerId === w.id);
      return {
        ...w,
        applicationStatus: app ? app.status : null,
        applicationId: app ? app.id : null,
      };
    });

    const minScore = 30;
    res.json(mapped.filter((w) => w.matchScore >= minScore && w.availability !== 'Not Available'));
  } catch (err) {
    console.error('Get suggested workers error:', err);
    res.status(500).json({ message: 'Failed to fetch workers' });
  }
}

export async function getMatches(req, res) {
  return getSuggestedWorkers(req, res);
}

export async function hireWorker(req, res) {
  try {
    const jobId = parseInt(req.params.id);
    const workerId = parseInt(req.body.workerId);

    if (isNaN(workerId)) {
      return res.status(400).json({ message: 'Invalid worker ID' });
    }

    const contractor = await prisma.contractor.findUnique({ where: { userId: req.userId } });
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job || job.contractorId !== contractor?.id) {
      return res.status(403).json({ message: 'Not authorized to hire for this job' });
    }

    const worker = await prisma.worker.findUnique({ 
      where: { id: workerId },
      include: { skills: true }
    });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const match = calculateMatchScore(worker, job);

    const application = await prisma.application.upsert({
      where: { jobId_workerId: { jobId, workerId } },
      create: { 
        jobId, 
        workerId, 
        status: 'SHORTLISTED', 
        matchScore: match.totalScore 
      },
      update: { 
        status: 'SHORTLISTED',
        matchScore: match.totalScore
      },
    });

    res.json({ message: 'Worker shortlisted successfully', application });
  } catch (err) {
    console.error('Shortlist worker error:', err);
    res.status(500).json({ message: 'Failed to shortlist worker' });
  }
}

export async function confirmHire(req, res) {
  try {
    const jobId = parseInt(req.params.id);
    const workerId = parseInt(req.body.workerId);

    if (isNaN(workerId)) {
      return res.status(400).json({ message: 'Invalid worker ID' });
    }

    const contractor = await prisma.contractor.findUnique({ where: { userId: req.userId } });
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job || job.contractorId !== contractor?.id) {
      return res.status(403).json({ message: 'Not authorized to manage this job' });
    }

    if (job.workersHired >= job.workersRequired) {
      return res.status(400).json({ message: 'All worker positions are filled' });
    }

    const app = await prisma.application.findUnique({
      where: { jobId_workerId: { jobId, workerId } }
    });

    if (!app || app.status !== 'ACCEPTED') {
      return res.status(400).json({ message: 'Worker has not accepted this offer yet' });
    }

    await prisma.application.update({
      where: { id: app.id },
      data: { status: 'CONFIRMED' },
    });

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        workersHired: { increment: 1 },
        status: job.workersHired + 1 >= job.workersRequired ? 'IN_PROGRESS' : job.status,
      },
    });

    res.json({ message: 'Worker hiring confirmed successfully', job: updatedJob });
  } catch (err) {
    console.error('Confirm hire error:', err);
    res.status(500).json({ message: 'Failed to confirm hiring' });
  }
}

export async function completeJob(req, res) {
  try {
    const jobId = parseInt(req.params.id);

    const contractor = await prisma.contractor.findUnique({ where: { userId: req.userId } });
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job || job.contractorId !== contractor?.id) {
      return res.status(403).json({ message: 'Not authorized to manage this job' });
    }

    // Update job status to COMPLETED
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { status: 'COMPLETED' },
    });

    // Update all CONFIRMED or WORK_STARTED applications for this job to COMPLETED
    await prisma.application.updateMany({
      where: {
        jobId,
        status: { in: ['CONFIRMED', 'WORK_STARTED'] },
      },
      data: { status: 'COMPLETED' },
    });

    // Increment jobsCompleted count for all workers who completed this job
    const confirmedApps = await prisma.application.findMany({
      where: { jobId, status: 'COMPLETED' },
    });

    for (const app of confirmedApps) {
      await prisma.worker.update({
        where: { id: app.workerId },
        data: { jobsCompleted: { increment: 1 } },
      });
    }

    res.json({ message: 'Job completed successfully!', job: updatedJob });
  } catch (err) {
    console.error('Complete job error:', err);
    res.status(500).json({ message: 'Failed to complete job' });
  }
}

export async function rateWorker(req, res) {
  try {
    const jobId = parseInt(req.params.id);
    const { workerId, rating, review, quality, reliability, behaviour } = req.body;

    const contractor = await prisma.contractor.findUnique({ where: { userId: req.userId } });
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job || job.contractorId !== contractor?.id) {
      return res.status(403).json({ message: 'Not authorized to review workers for this job' });
    }

    const ratingVal = parseFloat(rating || 0);

    // Create the rating record
    await prisma.rating.create({
      data: {
        workerId: parseInt(workerId),
        jobId,
        rating: ratingVal,
        quality: quality ? parseFloat(quality) : null,
        reliability: reliability ? parseFloat(reliability) : null,
        behaviour: behaviour ? parseFloat(behaviour) : null,
        review,
      },
    });

    // Calculate new average rating for the worker
    const workerRatings = await prisma.rating.findMany({
      where: { workerId: parseInt(workerId) },
      select: { rating: true },
    });

    const sum = workerRatings.reduce((acc, r) => acc + r.rating, 0);
    const avg = sum / (workerRatings.length || 1);

    const updatedWorker = await prisma.worker.update({
      where: { id: parseInt(workerId) },
      data: { rating: avg },
    });

    res.json({ message: 'Worker rated successfully!', worker: updatedWorker });
  } catch (err) {
    console.error('Rate worker error:', err);
    res.status(500).json({ message: 'Failed to submit rating' });
  }
}

export async function createHouseholdRequest(req, res) {
  try {
    const contractor = await prisma.contractor.findUnique({ where: { userId: req.userId } });
    if (!contractor) return res.status(404).json({ message: 'Contractor profile not found' });

    const { service, location, preferredDate, budget, description, workerId } = req.body;
    const { getCoordsFromLocation } = await import('../utils/location.js');
    const coords = getCoordsFromLocation(location);

    const job = await prisma.job.create({
      data: {
        contractorId: contractor.id,
        title: `Household Service: ${service} at ${location}`,
        skillRequired: service,
        workersRequired: 1,
        location,
        dailyWage: parseInt(budget),
        duration: 1,
        startDate: new Date(preferredDate),
        description: description || `Household request for ${service}`,
        isHousehold: true,
        latitude: coords.lat,
        longitude: coords.lng,
      },
    });

    const app = await prisma.application.create({
      data: {
        jobId: job.id,
        workerId: parseInt(workerId),
        status: 'SHORTLISTED',
        matchScore: 95,
      },
    });

    res.status(201).json({ message: 'Household service request submitted successfully!', job, application: app });
  } catch (err) {
    console.error('Create household request error:', err);
    res.status(500).json({ message: 'Failed to submit service request' });
  }
}
