import prisma from '../utils/prisma.js';
import { getCoordsFromLocation } from '../utils/location.js';
import { rankJobsForWorker } from '../services/matchingService.js';
import { calculateMatchScore } from '../services/matchingService.js';
import { isProfileComplete } from '../utils/profile.js';

export async function getMe(req, res) {
  try {
    const worker = await prisma.worker.findUnique({
      where: { userId: req.userId },
      include: { user: true, skills: true },
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    res.json({
      ...worker,
      profileComplete: isProfileComplete(req.user),
    });
  } catch (err) {
    console.error('Get worker error:', err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
}

export async function updateMe(req, res) {
  try {
    const { experience, location, expectedWage, availability, skills } = req.body;
    const coords = getCoordsFromLocation(location);

    const worker = await prisma.worker.update({
      where: { userId: req.userId },
      data: {
        experience: experience ?? undefined,
        location: location ?? undefined,
        expectedWage: expectedWage ?? undefined,
        availability: availability ?? undefined,
        latitude: coords.lat,
        longitude: coords.lng,
      },
      include: { user: true, skills: true },
    });

    if (skills?.length) {
      await prisma.workerSkill.deleteMany({ where: { workerId: worker.id } });
      await prisma.workerSkill.createMany({
        data: skills.map((skill) => ({ workerId: worker.id, skill })),
      });
    }

    const updated = await prisma.worker.findUnique({
      where: { userId: req.userId },
      include: { user: true, skills: true },
    });

    const freshUser = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { worker: { include: { skills: true } }, contractor: true, company: true },
    });

    res.json({ ...updated, profileComplete: isProfileComplete(freshUser) });
  } catch (err) {
    console.error('Update worker error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
}

export async function getJobs(req, res) {
  try {
    const worker = await prisma.worker.findUnique({
      where: { userId: req.userId },
      include: { skills: true },
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const jobs = await prisma.job.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      include: { contractor: true },
      orderBy: { createdAt: 'desc' },
    });

    const ranked = rankJobsForWorker(worker, jobs);
    res.json(ranked);
  } catch (err) {
    console.error('Get jobs error:', err);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
}

export async function getJobById(req, res) {
  try {
    const jobId = parseInt(req.params.id);
    const worker = await prisma.worker.findUnique({
      where: { userId: req.userId },
      include: { skills: true },
    });

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { contractor: true },
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const existingApp = worker
      ? await prisma.application.findUnique({
          where: { jobId_workerId: { jobId, workerId: worker.id } },
        })
      : null;

    const match = worker ? calculateMatchScore(worker, job) : null;

    res.json({
      ...job,
      matchScore: match?.totalScore,
      matchBreakdown: match
        ? {
            skillScore: match.skillScore,
            experienceScore: match.experienceScore,
            locationScore: match.locationScore,
            availabilityScore: match.availabilityScore,
            wageScore: match.wageScore,
          }
        : null,
      distance: match?.distance,
      alreadyApplied: !!existingApp,
    });
  } catch (err) {
    console.error('Get job error:', err);
    res.status(500).json({ message: 'Failed to fetch job' });
  }
}

export async function applyToJob(req, res) {
  try {
    const jobId = parseInt(req.params.id);
    const worker = await prisma.worker.findUnique({
      where: { userId: req.userId },
      include: { skills: true },
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const existing = await prisma.application.findUnique({
      where: { jobId_workerId: { jobId, workerId: worker.id } },
    });

    if (existing) {
      return res.status(409).json({ message: 'You have already applied to this job' });
    }

    const match = calculateMatchScore(worker, job);

    const application = await prisma.application.create({
      data: {
        jobId,
        workerId: worker.id,
        matchScore: match.totalScore,
        status: 'APPLIED',
      },
      include: { job: { include: { contractor: true } } },
    });

    res.status(201).json({ message: 'Application submitted successfully.', application });
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).json({ message: 'Failed to submit application' });
  }
}

export async function getApplications(req, res) {
  try {
    const worker = await prisma.worker.findUnique({ where: { userId: req.userId } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const applications = await prisma.application.findMany({
      where: { workerId: worker.id },
      include: { job: { include: { contractor: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(applications);
  } catch (err) {
    console.error('Get applications error:', err);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
}

export async function getWorkerById(req, res) {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { user: true, skills: true },
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.json(worker);
  } catch (err) {
    console.error('Get worker by id error:', err);
    res.status(500).json({ message: 'Failed to fetch worker' });
  }
}
