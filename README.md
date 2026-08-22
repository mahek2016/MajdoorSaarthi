# MajdoorSaarthi

**Kaam bhi. Kaamgar bhi.**

A digital blue-collar workforce platform connecting **Workers**, **Contractors**, and **Companies** — built as a 40% functional MVP for a final-year academic project.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, JavaScript, React Router |
| Styling | Plain CSS + CSS Modules |
| Backend | Node.js, Express.js |
| Database | MySQL |
| ORM | Prisma |
| Auth | JWT + Mock OTP (development) |

## Project Structure

```
MajdoorSaarthi/
├── frontend/          # React + Vite web app
├── backend/           # Express REST API
├── prisma/            # Schema & seed data
├── .env.example       # Environment template
└── README.md
```

## Features (MVP)

### Workers
- Job discovery with rule-based match scores
- Apply to jobs and track application timeline
- Profile management

### Contractors
- Post jobs and view suggested workers
- Hire workers based on match ranking
- Manage active jobs

### Companies
- Create and track projects
- Workforce overview (attendance, skills, contractor allocation)

### Matching Algorithm
Transparent **rule-based** scoring (not ML):
- Skill Match: 40%
- Experience: 20%
- Location: 15%
- Availability: 15%
- Wage Compatibility: 10%

Architecture is designed to swap in a real ML model later via `matchingService.js`.

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+

### 1. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```
DATABASE_URL="mysql://root:password@localhost:3306/majdoorsaarthi"
JWT_SECRET="your-secret-key"
PORT=5000
MOCK_OTP=123456
VITE_API_URL=http://localhost:5000/api
```

Create the database:

```sql
CREATE DATABASE majdoorsaarthi;
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run db:setup
npm run dev
```

API runs at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Web app runs at `http://localhost:5173`

## Demo Accounts

Use OTP **`123456`** for all logins.

| Role | Mobile | Password |
|------|--------|----------|
| Worker | 9000000001 | password123 |
| Contractor | 9000000002 | password123 |
| Company | 9000000003 | password123 |

### Seed Workers (for matching demos)

| Name | Mobile | Skill | Location |
|------|--------|-------|----------|
| Ramesh Kumar | 9876543210 | Electrician | Vasai |
| Suresh Patil | 9876543211 | Electrician | Mumbai |
| Amit Yadav | 9876543212 | Plumber | Thane |
| Rahul Sharma | 9876543213 | Painter | Virar |

## API Endpoints

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/verify-otp`
- `POST /api/auth/select-role`

### Worker
- `GET /api/workers/me`
- `PUT /api/workers/me`
- `GET /api/workers/jobs`
- `GET /api/workers/jobs/:id`
- `POST /api/workers/jobs/:id/apply`
- `GET /api/workers/applications`

### Contractor
- `GET /api/contractors/me`
- `PUT /api/contractors/me`
- `POST /api/jobs`
- `GET /api/jobs/my-jobs`
- `GET /api/jobs/:id/workers`
- `POST /api/jobs/:id/hire`

### Company
- `GET /api/companies/me`
- `PUT /api/companies/me`
- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id/workforce`

### Matching
- `GET /api/jobs/:jobId/matches`

## Future Scope (Not Implemented)

- Individual/Customer role (home services hiring)
- Real OTP/SMS and payment gateway
- WhatsApp integration
- Advanced ML matching
- Automated payroll, dispute management, blockchain, etc.

## License

Academic project — MajdoorSaarthi © 2026
