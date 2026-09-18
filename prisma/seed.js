const path = require('path');
const dotenv = require('dotenv');

const rootEnv = path.join(__dirname, '..', '.env');
dotenv.config({ path: rootEnv });

if (!process.env.DATABASE_URL) {
  console.error(`DATABASE_URL is missing. Expected it in ${rootEnv}`);
  process.exit(1);
}

const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const CITY_COORDS = {
  mumbai: { lat: 19.076, lng: 72.8777 },
  vasai: { lat: 19.3919, lng: 72.8397 },
  virar: { lat: 19.4559, lng: 72.8115 },
  palghar: { lat: 19.6967, lng: 72.7654 },
  thane: { lat: 19.2183, lng: 72.9781 },
};

const DEMO_PASSWORD = 'password123';

function coordsFor(location) {
  const lower = (location || '').toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(city)) return coords;
  }
  return CITY_COORDS.mumbai;
}

function dayRange(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

async function upsertUser({ phone, name, role, passwordHash }) {
  return prisma.user.upsert({
    where: { phone },
    update: {
      name,
      role,
      otpVerified: true,
      password: passwordHash,
    },
    create: {
      phone,
      name,
      role,
      otpVerified: true,
      password: passwordHash,
    },
  });
}

async function ensureJob(contractorId, data) {
  const existing = await prisma.job.findFirst({
    where: { contractorId, title: data.title },
  });
  if (existing) {
    return prisma.job.update({
      where: { id: existing.id },
      data: {
        skillRequired: data.skillRequired,
        workersRequired: data.workersRequired,
        workersHired: data.workersHired,
        location: data.location,
        dailyWage: data.dailyWage,
        duration: data.duration,
        startDate: data.startDate,
        description: data.description,
        status: data.status,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
  }
  return prisma.job.create({
    data: { contractorId, ...data },
  });
}

async function ensureAttendance({ workerId, projectId, date, status }) {
  const { start, end } = dayRange(date);
  const existing = await prisma.attendance.findFirst({
    where: {
      workerId,
      projectId,
      date: { gte: start, lt: end },
    },
  });
  if (existing) {
    return prisma.attendance.update({
      where: { id: existing.id },
      data: { status },
    });
  }
  return prisma.attendance.create({
    data: { workerId, projectId, date, status },
  });
}

async function ensureRating({ workerId, rating, review }) {
  const existing = await prisma.rating.findFirst({
    where: { workerId, review },
  });
  if (existing) {
    return prisma.rating.update({
      where: { id: existing.id },
      data: { rating },
    });
  }
  return prisma.rating.create({
    data: { workerId, rating, review },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const workerDefs = [
    {
      phone: '9000000001',
      name: 'Ramesh Kumar',
      skill: 'Electrician',
      extraSkills: ['Helper'],
      experience: 5,
      location: 'Vasai',
      expectedWage: 900,
      rating: 4.6,
      jobsCompleted: 42,
      attendance: 96,
      previousWork: 'Residential wiring and panel upgrades across Vasai-Virar.',
    },
    {
      phone: '9876543211',
      name: 'Suresh Patil',
      skill: 'Electrician',
      extraSkills: [],
      experience: 4,
      location: 'Mumbai',
      expectedWage: 850,
      rating: 4.4,
      jobsCompleted: 31,
      attendance: 94,
      previousWork: 'Commercial electrical fit-outs in Andheri and Bandra.',
    },
    {
      phone: '9876543212',
      name: 'Amit Yadav',
      skill: 'Plumber',
      extraSkills: ['Helper'],
      experience: 6,
      location: 'Thane',
      expectedWage: 800,
      rating: 4.7,
      jobsCompleted: 55,
      attendance: 98,
      previousWork: 'Pipeline and bathroom fitting work on housing societies in Thane.',
    },
    {
      phone: '9876543213',
      name: 'Rahul Sharma',
      skill: 'Painter',
      extraSkills: [],
      experience: 3,
      location: 'Virar',
      expectedWage: 750,
      rating: 4.2,
      jobsCompleted: 18,
      attendance: 92,
      previousWork: 'Interior and exterior painting for villas in Virar West.',
    },
  ];

  const workers = [];
  for (const def of workerDefs) {
    const geo = coordsFor(def.location);
    const user = await upsertUser({
      phone: def.phone,
      name: def.name,
      role: 'WORKER',
      passwordHash,
    });

    const worker = await prisma.worker.upsert({
      where: { userId: user.id },
      update: {
        experience: def.experience,
        location: def.location,
        expectedWage: def.expectedWage,
        availability: 'Available',
        rating: def.rating,
        jobsCompleted: def.jobsCompleted,
        attendance: def.attendance,
        previousWork: def.previousWork,
        latitude: geo.lat,
        longitude: geo.lng,
      },
      create: {
        userId: user.id,
        experience: def.experience,
        location: def.location,
        expectedWage: def.expectedWage,
        availability: 'Available',
        rating: def.rating,
        jobsCompleted: def.jobsCompleted,
        attendance: def.attendance,
        previousWork: def.previousWork,
        latitude: geo.lat,
        longitude: geo.lng,
      },
    });

    const skills = [def.skill, ...def.extraSkills];
    await prisma.workerSkill.deleteMany({
      where: {
        workerId: worker.id,
        skill: { notIn: skills },
      },
    });
    for (const skill of skills) {
      await prisma.workerSkill.upsert({
        where: { workerId_skill: { workerId: worker.id, skill } },
        update: {},
        create: { workerId: worker.id, skill },
      });
    }

    workers.push({ ...def, user, worker });
  }

  const contractorUser = await upsertUser({
    phone: '9000000002',
    name: 'Vikram Desai',
    role: 'CONTRACTOR',
    passwordHash,
  });

  const contractor = await prisma.contractor.upsert({
    where: { userId: contractorUser.id },
    update: {
      businessName: 'Shree Builders',
      location: 'Vasai',
      typeOfWork: 'Electrical, Plumbing, Painting',
      experience: 12,
    },
    create: {
      userId: contractorUser.id,
      businessName: 'Shree Builders',
      location: 'Vasai',
      typeOfWork: 'Electrical, Plumbing, Painting',
      experience: 12,
    },
  });

  const companyUser = await upsertUser({
    phone: '9000000003',
    name: 'Priya Mehta',
    role: 'COMPANY',
    passwordHash,
  });

  const company = await prisma.company.upsert({
    where: { userId: companyUser.id },
    update: {
      companyName: 'Horizon Infra Pvt Ltd',
      industry: 'Construction',
      location: 'Mumbai',
      contactPerson: 'Priya Mehta',
      companySize: '51-200',
    },
    create: {
      userId: companyUser.id,
      companyName: 'Horizon Infra Pvt Ltd',
      industry: 'Construction',
      location: 'Mumbai',
      contactPerson: 'Priya Mehta',
      companySize: '51-200',
    },
  });

  const startSoon = new Date();
  startSoon.setDate(startSoon.getDate() + 3);
  startSoon.setHours(9, 0, 0, 0);

  const jobDefs = [
    {
      title: 'Site Electrician — Vasai Township',
      skillRequired: 'Electrician',
      workersRequired: 2,
      workersHired: 1,
      location: 'Vasai',
      dailyWage: 900,
      duration: 15,
      startDate: startSoon,
      description: 'Need experienced electricians for wiring, DB boards, and fixture installation at a residential township site in Vasai.',
      status: 'IN_PROGRESS',
    },
    {
      title: 'Commercial Wiring — Andheri',
      skillRequired: 'Electrician',
      workersRequired: 3,
      workersHired: 0,
      location: 'Mumbai',
      dailyWage: 950,
      duration: 20,
      startDate: startSoon,
      description: 'Electrical fit-out for a commercial office floor in Andheri. Cable tray, lighting, and power points.',
      status: 'OPEN',
    },
    {
      title: 'Plumbing Fit-out — Thane Society',
      skillRequired: 'Plumber',
      workersRequired: 2,
      workersHired: 0,
      location: 'Thane',
      dailyWage: 820,
      duration: 12,
      startDate: startSoon,
      description: 'Bathroom and kitchen plumbing for a new wing in a Thane housing society.',
      status: 'OPEN',
    },
    {
      title: 'Interior Painting — Virar West',
      skillRequired: 'Painter',
      workersRequired: 2,
      workersHired: 0,
      location: 'Virar',
      dailyWage: 760,
      duration: 10,
      startDate: startSoon,
      description: 'Interior wall putty, primer, and emulsion painting for 8 flats in Virar West.',
      status: 'OPEN',
    },
  ];

  const jobs = [];
  for (const def of jobDefs) {
    const geo = coordsFor(def.location);
    const job = await ensureJob(contractor.id, { ...def, latitude: geo.lat, longitude: geo.lng });
    jobs.push(job);
  }

  const [ramesh, suresh, amit, rahul] = workers;
  const [vasaiElectrical, andheriElectrical, thanePlumbing, virarPainting] = jobs;

  const applications = [
    { jobId: vasaiElectrical.id, workerId: ramesh.worker.id, matchScore: 92, status: 'CONFIRMED' },
    { jobId: vasaiElectrical.id, workerId: suresh.worker.id, matchScore: 78, status: 'SHORTLISTED' },
    { jobId: andheriElectrical.id, workerId: suresh.worker.id, matchScore: 88, status: 'APPLIED' },
    { jobId: andheriElectrical.id, workerId: ramesh.worker.id, matchScore: 81, status: 'APPLIED' },
    { jobId: thanePlumbing.id, workerId: amit.worker.id, matchScore: 90, status: 'APPLIED' },
    { jobId: virarPainting.id, workerId: rahul.worker.id, matchScore: 86, status: 'APPLIED' },
  ];

  for (const app of applications) {
    await prisma.application.upsert({
      where: { jobId_workerId: { jobId: app.jobId, workerId: app.workerId } },
      update: { matchScore: app.matchScore, status: app.status },
      create: app,
    });
  }

  const projectStart = new Date();
  projectStart.setDate(projectStart.getDate() - 5);
  projectStart.setHours(8, 0, 0, 0);

  const existingProject = await prisma.project.findFirst({
    where: { companyId: company.id, name: 'Vasai Township Tower A' },
  });

  const projectData = {
    companyId: company.id,
    name: 'Vasai Township Tower A',
    location: 'Vasai',
    workersRequired: 8,
    requiredSkills: JSON.stringify(['Electrician', 'Plumber', 'Painter', 'Helper']),
    budget: 2500000,
    duration: 90,
    startDate: projectStart,
    progress: 22,
    status: 'ACTIVE',
  };

  const project = existingProject
    ? await prisma.project.update({ where: { id: existingProject.id }, data: projectData })
    : await prisma.project.create({ data: projectData });

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  await ensureAttendance({ workerId: ramesh.worker.id, projectId: project.id, date: yesterday, status: 'PRESENT' });
  await ensureAttendance({ workerId: ramesh.worker.id, projectId: project.id, date: today, status: 'PRESENT' });
  await ensureAttendance({ workerId: amit.worker.id, projectId: project.id, date: yesterday, status: 'PRESENT' });
  await ensureAttendance({ workerId: amit.worker.id, projectId: project.id, date: today, status: 'ABSENT' });
  await ensureAttendance({ workerId: rahul.worker.id, projectId: project.id, date: today, status: 'PRESENT' });

  await ensureRating({
    workerId: ramesh.worker.id,
    rating: 4.6,
    review: 'Reliable electrician. Finished DB work on schedule.',
  });
  await ensureRating({
    workerId: amit.worker.id,
    rating: 4.7,
    review: 'Neat plumbing work and good site discipline.',
  });

  console.log('Seed complete.');
  console.log('Demo logins (password: password123):');
  console.log('  Worker     9000000001  Ramesh Kumar');
  console.log('  Contractor 9000000002  Vikram Desai / Shree Builders');
  console.log('  Company    9000000003  Priya Mehta / Horizon Infra Pvt Ltd');
  console.log('Records:');
  console.log('  Users: 6 (login worker 9000000001 + 3 extra workers + contractor + company)');
  console.log(`  Workers: 4`);
  console.log(`  Worker skills: 6`);
  console.log(`  Contractors: 1`);
  console.log(`  Companies: 1`);
  console.log(`  Jobs: ${jobs.length}`);
  console.log(`  Applications: ${applications.length}`);
  console.log(`  Projects: 1`);
  console.log(`  Attendance: 5`);
  console.log(`  Ratings: 2`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
