import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import { signToken } from '../utils/jwt.js';
import { formatUserResponse } from '../utils/profile.js';
import { rankWorkersForJob } from '../services/matchingService.js';

const MOCK_OTP = process.env.MOCK_OTP || '123456';

export async function signup(req, res) {
  try {
    const { name, phone, password } = req.body;

    if (!name?.trim() || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone, and password are required' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Enter valid 10-digit mobile number' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return res.status(409).json({ message: 'Mobile number already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name: name.trim(), phone, password: hashed },
    });

    res.status(201).json({ message: 'Account created. Verify OTP to continue.', phone });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Failed to create account' });
  }
}

export async function login(req, res) {
  try {
    const { phone, password, role } = req.body;

    if (!phone || !password || !role) {
      return res.status(400).json({ message: 'Phone, password, and role are required' });
    }

    const user = await prisma.user.findUnique({
      where: { phone },
      include: { worker: true, contractor: true, company: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid mobile number or password' });
    }

    if (user.role && user.role !== role) {
      const displayRole = user.role.charAt(0) + user.role.slice(1).toLowerCase();
      return res.status(400).json({ message: `This account is registered as a ${displayRole}. Please select ${displayRole}.` });
    }

    res.json({ message: 'OTP sent (mock). Verify to continue.', phone });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
}

export async function verifyOTP(req, res) {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }
    if (otp !== MOCK_OTP) {
      return res.status(400).json({ message: 'Invalid OTP. Use 123456 for development.' });
    }

    const user = await prisma.user.findUnique({
      where: { phone },
      include: { worker: { include: { skills: true } }, contractor: true, company: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { otpVerified: true },
    });

    const token = signToken({ userId: user.id, role: user.role });
    res.json({ token, user: formatUserResponse(user) });
  } catch (err) {
    console.error('OTP error:', err);
    res.status(500).json({ message: 'OTP verification failed' });
  }
}

export async function selectRole(req, res) {
  try {
    const { role } = req.body;
    const validRoles = ['WORKER', 'CONTRACTOR', 'COMPANY'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { role },
      include: { worker: { include: { skills: true } }, contractor: true, company: true },
    });

    if (role === 'WORKER' && !user.worker) {
      await prisma.worker.create({
        data: { userId: user.id, location: '', expectedWage: 0 },
      });
    } else if (role === 'CONTRACTOR' && !user.contractor) {
      await prisma.contractor.create({
        data: { userId: user.id, businessName: '', location: '' },
      });
    } else if (role === 'COMPANY' && !user.company) {
      await prisma.company.create({
        data: {
          userId: user.id,
          companyName: '',
          industry: '',
          location: '',
          contactPerson: user.name,
          companySize: '1-10',
        },
      });
    }

    const updated = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { worker: { include: { skills: true } }, contractor: true, company: true },
    });

    const token = signToken({ userId: updated.id, role: updated.role });
    res.json({ token, user: formatUserResponse(updated) });
  } catch (err) {
    console.error('Select role error:', err);
    res.status(500).json({ message: 'Failed to select role' });
  }
}

export async function demoMatch(req, res) {
  try {
    const { skill, location, availability, experience } = req.body;

    const mockJob = {
      skillRequired: skill,
      location: location || '',
      requiredAvailability: availability || 'Available',
      experienceRequired: parseInt(experience || 0),
      dailyWage: 900
    };

    const workers = await prisma.worker.findMany({
      include: { user: true, skills: true }
    });

    const ranked = rankWorkersForJob(workers, mockJob);

    const masked = ranked.map(w => {
      const nameParts = (w.user?.name || 'Worker').split(' ');
      const maskedName = nameParts[0] + (nameParts[1] ? ' ' + nameParts[1][0] + '.' : '');
      return {
        id: w.id,
        name: maskedName,
        skill: w.skills?.[0]?.skill || 'Helper',
        location: w.location,
        score: w.matchScore,
        verificationStatus: w.verificationStatus,
        availability: w.availability
      };
    });

    res.json(masked);
  } catch (err) {
    console.error('Demo match error:', err);
    res.status(500).json({ message: 'Matching demo failed' });
  }
}
