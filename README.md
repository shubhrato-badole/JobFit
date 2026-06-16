# JobFit — AI-Powered Job Matching Platform

> Know exactly why you are not getting callbacks.

**Live Demo → [job-fit-murex.vercel.app](https://job-fit-murex.vercel.app)**  
**Backend API → [jobfit-guyz.onrender.com](https://jobfit-guyz.onrender.com)**  
**Built by → [Shubhrato Badole](https://linkedin.com/in/shubhrato)**

---

## The Problem

Most developers apply to 50+ jobs and hear nothing back. They do not know if their resume is wrong, their skills do not match, or the job itself is unrealistic. Manually comparing your resume against 20 job descriptions takes 4–5 hours and you are still just guessing.

## The Solution

JobFit lets you upload your resume once. Search real job listings from LinkedIn and Indeed. Get an AI-generated match score from 0–100 with the **exact skills you are missing**, your **strengths for that specific role**, and **how to improve**. Track every application on a Kanban board. Chat with an AI coach that already knows your resume and the job description.

---

## Features

| Feature | Description |
|---|---|
| **AI Match Score** | Gemini AI analyzes your resume against any job description and returns a 0–100 score with skill gap analysis |
| **Real Job Search** | Search live listings from LinkedIn, Indeed, and Glassdoor via JSearch API |
| **Application Tracker** | Kanban board — Applied, Interview, Offer, Rejected — with full analysis on each card |
| **AI Chat** | Chat with an AI career coach that knows your resume and the specific JD |
| **Privacy Scanner** | Automatically flags PII risks in your resume before you apply |
| **Redis Caching** | Same resume + JD returns in under 5ms instead of 4 seconds — 800x faster |
| **Admin Dashboard** | Platform analytics — total users, analyses run, skill gap trends across all users |
| **Google OAuth** | One-click sign in with Google alongside email/password auth |
| **Email Verification** | Nodemailer verification flow with resend support |
| **Forgot Password** | Cryptographic token-based password reset via email |

---

## Tech Stack

### Frontend
- **React 18** with React Router v6 — client-side routing, no page reloads
- **Tailwind CSS** — utility-first styling
- **Vite** — fast builds and hot module replacement
- **Axios** — HTTP client with `withCredentials: true` for cross-domain cookies
- Deployed on **Vercel** with `vercel.json` rewrite for SPA routing

### Backend
- **Node.js + Express** — REST API with ES modules
- **Passport.js** — Google OAuth 2.0 strategy
- **Multer** (memoryStorage) — PDF upload without touching disk
- **pdf-parse** — extract text from uploaded resume
- **Nodemailer** — email verification and password reset
- **Helmet** — security headers on every response
- **express-rate-limit** — brute force protection on auth routes
- Deployed on **Render**

### Database & Cache
- **PostgreSQL** — relational data with JSONB columns for AI skill arrays
- **Redis (Upstash)** — in-memory cache for AI responses
- MD5 content-based cache keys — same resume + JD always returns same result
- Cache TTL: 1 hour

### AI
- **Gemini 1.5 Flash** via Google AI Studio
- Structured JSON prompt engineering — strict output format, no markdown
- Response validation before `JSON.parse()`

### DevOps
- **Docker Compose** — 5 services: React (Nginx), Node.js, PostgreSQL, Redis, Nginx reverse proxy
- **GitHub Actions** — CI/CD pipeline, auto-deploys to Render on every push to `main`
- **Nginx** — reverse proxy routing `/api/*` to Node, `/*` to React, rate limiting

---

## Architecture

```
Browser
   │
   ▼
Vercel (React + Nginx)
   │
   │  API calls (HTTPS, httpOnly cookies)
   ▼
Render (Node.js + Express)
   │
   ├── PostgreSQL (users, applications, saved_jobs)
   ├── Redis / Upstash (AI response cache)
   └── Gemini API (AI analysis + chat)
```

### Authentication Flow

```
Register → bcrypt hash → save to DB → send verification email
Login    → verify password → check is_verified
       → sign access token (30min) + refresh token (7d)
       → set httpOnly cookies (sameSite: none, secure: true)

Every request → Authorization middleware
             → verify access token
             → if expired → verify refresh token
             → issue new tokens transparently
             → continue request
```

Tokens are stored in **httpOnly cookies** — JavaScript cannot read them, protecting against XSS. Refresh token rotation means every new access token also rotates the refresh token, invalidating any stolen tokens.

### Redis Caching Flow

```
POST /api/ai/analyze
   │
   ├── Create cache key: MD5(resumeText + jobDescription)
   ├── Check Redis → HIT  → return in <5ms
   │                 MISS → call Gemini (2-4 seconds)
   │                      → cache result for 1 hour
   └── Return { matchScore, missingSkills, strengths, suggestions }
```

---

## Performance

| Metric | Value |
|---|---|
| Cache miss (Gemini API call) | 2,000 – 4,000ms |
| Cache hit (Redis) | < 5ms |
| Speed improvement | **800x faster** on repeat analyses |
| Cache TTL | 3,600 seconds (1 hour) |
| Concurrent load tested | 50 parallel requests |

---

## Security

- **httpOnly cookies** — tokens inaccessible to JavaScript (XSS protection)
- **sameSite: none + secure: true** — cross-domain cookie support (OWASP compliant)
- **bcrypt** at 10 rounds — password hashing
- **Parameterised SQL queries** — SQL injection prevention throughout
- **Helmet.js** — sets 11 security headers (CSP, HSTS, X-Frame-Options etc.)
- **Rate limiting** — 30 req/min on API, 10 req/min on auth routes
- **Refresh token rotation** — reuse detection invalidates both tokens
- **Crypto random tokens** — 32-byte cryptographically secure tokens for email verification and password reset
- **OWASP Top 10** alignment throughout

---

## Database Schema

```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(255) NOT NULL,
  email             VARCHAR(255) UNIQUE NOT NULL,
  password          VARCHAR(255) NOT NULL,
  resume_text       TEXT,
  resume_uploaded_at TIMESTAMP,
  role              VARCHAR(50) DEFAULT 'user',
  is_verified       BOOLEAN DEFAULT false,
  verify_token      TEXT,
  refreshtoken      TEXT,
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE applications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  company        VARCHAR(255) NOT NULL,
  role           VARCHAR(255) NOT NULL,
  job_desc       TEXT NOT NULL,
  match_score    INTEGER CHECK (match_score BETWEEN 0 AND 100),
  missing_skills JSONB,
  strengths      JSONB,
  suggestions    TEXT,
  status         VARCHAR(50) DEFAULT 'APPLIED',
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE saved_jobs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  company    VARCHAR(255) NOT NULL,
  location   VARCHAR(255),
  job_desc   TEXT,
  source_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis (or Upstash account)
- Gemini API key from [aistudio.google.com](https://aistudio.google.com)
- RapidAPI key for JSearch

### Setup

```bash
# Clone the repo
git clone https://github.com/shubhrato/jobfit.git
cd jobfit

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### Environment Variables

Create `server/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/jobfit
JWT_SECRET_ACESSTOKEN=your_access_secret
JWT_SECRET_REFRESHTOKEN=your_refresh_secret
GEMINI_API_KEY=your_gemini_key
GEMINI_CHAT_API_KEY=your_second_gemini_key
RAPIDAPI_KEY=your_rapidapi_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
NODE_ENV=development
REDIS_URL=redis://localhost:6379
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### Run locally

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

App runs at `http://localhost:5173`

### Run with Docker

```bash
# From root folder
docker-compose up --build

# App runs at http://localhost:80
```

---

## Project Structure

```
jobfit/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Onboarding.jsx      # resume upload + AI scoring
│   │   │   ├── Dashboard.jsx       # stats overview
│   │   │   ├── Analysze.jsx        # core AI analysis feature
│   │   │   ├── Tracker.jsx         # Kanban application tracker
│   │   │   ├── JobSearch.jsx       # real job listings
│   │   │   ├── SavedJobs.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Admin.jsx           # admin dashboard
│   │   │   ├── AiChatBot.jsx       # AI chat component
│   │   │   ├── AuthContext.jsx     # global auth state
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── VerifyEmail.jsx
│   │   │   └── protectedRoutes.jsx
│   │   └── components/
│   │       ├── Api.js              # axios instance
│   │       ├── Navbar.jsx
│   │       └── Footer.jsx
│   ├── Dockerfile                  # multi-stage: Node builder + Nginx
│   ├── nginx.conf                  # SPA routing (try_files)
│   └── vercel.json                 # rewrite all routes to index.html
│
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── index.js                # Express app entry point
│   │   ├── database.js             # pg.Pool connection
│   │   ├── lib/
│   │   │   └── redis.js            # ioredis client with error handler
│   │   ├── middleware/
│   │   │   ├── authmiddelware.js   # JWT verification + refresh
│   │   │   └── RateLimit.js
│   │   └── routes/
│   │       ├── auth.js             # register, login, OAuth, verify, reset
│   │       ├── resume.js           # PDF upload + AI scoring
│   │       ├── jobanalysze.js      # core AI match analysis + Redis cache
│   │       ├── ChatBot.js          # AI chat with context
│   │       ├── tracker.js          # application CRUD
│   │       ├── dashboard.js        # stats + skill gap aggregation
│   │       ├── jobsearch.js        # JSearch API proxy + saved jobs
│   │       ├── profile.js          # user profile management
│   │       └── admin.js            # admin-only analytics
│   ├── db/
│   │   └── schema.sql
│   └── Dockerfile
│
├── nginx/
│   └── nginx.conf                  # reverse proxy + rate limiting
└── docker-compose.yml              # 5 services
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ✗ | Register with email + password |
| POST | `/api/auth/login` | ✗ | Login, returns JWT cookies |
| POST | `/api/auth/logout` | ✓ | Clear cookies |
| GET | `/api/auth/me` | ✓ | Get current user |
| GET | `/api/auth/google` | ✗ | Google OAuth redirect |
| GET | `/api/auth/google/callback` | ✗ | OAuth callback |
| GET | `/api/auth/verify-email` | ✗ | Verify email token |
| POST | `/api/auth/resend-verification` | ✗ | Resend verification email |
| POST | `/api/auth/forgot-password` | ✗ | Send reset email |
| POST | `/api/auth/reset-password` | ✗ | Reset with token |
| POST | `/api/resume/upload` | ✓ | Upload PDF + extract text |
| POST | `/api/ai/analyze` | ✓ | AI job match analysis |
| POST | `/api/chat` | ✓ | AI chat with resume + JD context |
| GET | `/api/tracker` | ✓ | Get all applications |
| POST | `/api/ai/tracker` | ✓ | Save analysis to tracker |
| PATCH | `/api/tracker/:id` | ✓ | Update application status |
| DELETE | `/api/tracker/:id` | ✓ | Delete application |
| GET | `/api/dashboard/stats` | ✓ | Platform stats for current user |
| GET | `/api/jobs/search` | ✓ | Search live job listings |
| POST | `/api/jobs/save` | ✓ | Save a job |
| GET | `/api/jobs/saved` | ✓ | Get saved jobs |
| DELETE | `/api/jobs/saved/:id` | ✓ | Remove saved job |
| GET | `/api/profile` | ✓ | Get profile |
| PATCH | `/api/profile` | ✓ | Update name/email |
| PATCH | `/api/profile/password` | ✓ | Change password |
| DELETE | `/api/profile` | ✓ | Delete account |
| GET | `/api/admin/stats` | ✓ Admin | Platform-wide analytics |

---

## CI/CD Pipeline

```
Push to main branch
      ↓
GitHub Actions triggers
      ↓
Webhook to Render → backend redeploys (3 min)
Vercel auto-detects push → frontend redeploys (2 min)
      ↓
Zero manual steps after initial setup
```

---

## What I Learned Building This

- How cross-domain cookies actually work (sameSite, secure, ITP)
- Why `pg.Pool` not `pg.Client` matters under concurrent load
- Redis crash prevention — `redis.on('error')` is not optional
- JWT refresh token rotation and reuse detection
- Why `memoryStorage` is critical on stateless deployment platforms
- JSONB in PostgreSQL and `jsonb_array_elements_text()` for skill analytics
- Multi-stage Docker builds — 10x smaller production images

---

## Author

**Shubhrato Badole**  
Final-year B.Tech CSE (Cybersecurity) — G.H. Raisoni College, Nagpur  
Cyber Cell Intern — State Cyber Crime Investigation Unit

[LinkedIn](https://linkedin.com/in/shubhrato) · [GitHub](https://github.com/shubhrato) · [bshubhrato@gmail.com](mailto:bshubhrato@gmail.com)

---

*JobFit is a portfolio project built to solve a real problem. If you are a developer who has ever applied to 20 jobs and heard nothing back — this was built for you.*