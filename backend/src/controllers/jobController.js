import prisma from '../utils/prisma.js';
import { getCoordsFromLocation } from '../utils/location.js';
import { rankWorkersForJob } from '../services/matchingService.js';
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
    const minScore = 30;
    res.json(ranked.filter((w) => w.matchScore >= minScore && w.availability !== 'Not Available'));
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
    const { workerId } = req.body;

    const contractor = await prisma.contractor.findUnique({ where: { userId: req.userId } });
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job || job.contractorId !== contractor?.id) {
      return res.status(403).json({ message: 'Not authorized to hire for this job' });
    }

    if (job.workersHired >= job.workersRequired) {
      return res.status(400).json({ message: 'All worker positions are filled' });
    }

    const worker = await prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    await prisma.application.upsert({
      where: { jobId_workerId: { jobId, workerId } },
      create: { jobId, workerId, status: 'SELECTED', matchScore: 0 },
      update: { status: 'SELECTED' },
    });

    await prisma.job.update({
      where: { id: jobId },
      data: {
        workersHired: { increment: 1 },
        status: job.workersHired + 1 >= job.workersRequired ? 'IN_PROGRESS' : job.status,
      },
    });

    res.json({ message: 'Worker hired successfully' });
  } catch (err) {
    console.error('Hire worker error:', err);
    res.status(500).json({ message: 'Failed to hire worker' });
  }
}
