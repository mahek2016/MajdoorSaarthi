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

export async function verifyKyc(req, res) {
  try {
    const { documentType, documentNumber } = req.body;
    if (!documentType || !documentNumber) {
      return res.status(400).json({ message: 'Document type and number are required' });
    }

    if (documentType === 'Aadhaar Card' && !/^\d{12}$/.test(documentNumber)) {
      return res.status(400).json({ message: 'Aadhaar Card number must be 12 digits' });
    }

    let status = 'VERIFIED';
    if (documentNumber.startsWith('9999')) {
      status = 'REJECTED';
    }

    const worker = await prisma.worker.update({
      where: { userId: req.userId },
      data: {
        verificationStatus: status,
        kycDocumentType: documentType,
        kycDocumentNumber: documentNumber,
      },
      include: { user: true, skills: true },
    });

    res.json({
      message: status === 'VERIFIED' ? 'KYC Verified successfully!' : 'KYC verification rejected.',
      worker,
    });
  } catch (err) {
    console.error('Verify KYC error:', err);
    res.status(500).json({ message: 'Failed to verify KYC' });
  }
}

export async function respondToApplication(req, res) {
  try {
    const appId = parseInt(req.params.id);
    const { action } = req.body;

    if (!['ACCEPT', 'REJECT'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be ACCEPT or REJECT' });
    }

    const worker = await prisma.worker.findUnique({ where: { userId: req.userId } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const app = await prisma.application.findUnique({
      where: { id: appId },
      include: { job: true },
    });

    if (!app || app.workerId !== worker.id) {
      return res.status(403).json({ message: 'Not authorized to respond to this application' });
    }

    if (app.status !== 'SHORTLISTED') {
      return res.status(400).json({ message: `Cannot respond. Current status is ${app.status}` });
    }

    const updated = await prisma.application.update({
      where: { id: appId },
      data: {
        status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED',
      },
    });

    res.json({ message: `Application ${action === 'ACCEPT' ? 'accepted' : 'rejected'} successfully`, application: updated });
  } catch (err) {
    console.error('Respond to application error:', err);
    res.status(500).json({ message: 'Failed to respond to application' });
  }
}

export async function getTodayAttendance(req, res) {
  try {
    const worker = await prisma.worker.findUnique({ where: { userId: req.userId } });
    if (!worker) return res.status(404).json({ message: 'Worker profile not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.attendance.findFirst({
      where: {
        workerId: worker.id,
        date: { gte: today },
      },
      include: { job: true },
    });

    res.json(record);
  } catch (err) {
    console.error('Get today attendance error:', err);
    res.status(500).json({ message: 'Failed to fetch attendance status' });
  }
}

export async function checkIn(req, res) {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'Job ID is required' });

    const worker = await prisma.worker.findUnique({ where: { userId: req.userId } });
    if (!worker) return res.status(404).json({ message: 'Worker profile not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findFirst({
      where: {
        workerId: worker.id,
        date: { gte: today },
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'Already checked in for today' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        workerId: worker.id,
        jobId: parseInt(jobId),
        date: new Date(),
        checkIn: new Date(),
        status: 'PRESENT',
      },
    });

    res.status(201).json({ message: 'Checked in successfully!', attendance });
  } catch (err) {
    console.error('Check in error:', err);
    res.status(500).json({ message: 'Failed to check in' });
  }
}

export async function checkOut(req, res) {
  try {
    const { attendanceId } = req.body;
    if (!attendanceId) return res.status(400).json({ message: 'Attendance ID is required' });

    const worker = await prisma.worker.findUnique({ where: { userId: req.userId } });
    if (!worker) return res.status(404).json({ message: 'Worker profile not found' });

    const app = await prisma.attendance.findUnique({ where: { id: parseInt(attendanceId) } });
    if (!app || app.workerId !== worker.id) {
      return res.status(403).json({ message: 'Unauthorized check-out' });
    }

    const attendance = await prisma.attendance.update({
      where: { id: parseInt(attendanceId) },
      data: {
        checkOut: new Date(),
      },
    });

    const history = await prisma.attendance.findMany({
      where: { workerId: worker.id },
    });
    const presentCount = history.filter((h) => h.status === 'PRESENT').length;
    const rate = (presentCount / history.length) * 100;

    await prisma.worker.update({
      where: { id: worker.id },
      data: { attendance: parseFloat(rate.toFixed(1)) },
    });

    res.json({ message: 'Checked out successfully!', attendance });
  } catch (err) {
    console.error('Check out error:', err);
    res.status(500).json({ message: 'Failed to check out' });
  }
}
