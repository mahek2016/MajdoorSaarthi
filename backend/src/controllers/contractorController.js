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
