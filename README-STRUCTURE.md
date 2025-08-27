# Wealth Management Content Studio - Project Structure

## Clean Directory Layout

```
wealth/
├── backend/               # Express backend server (port 3001)
│   ├── src/              # Source code
│   │   ├── api/          # AI agents and partner APIs
│   │   ├── config/       # Configuration (brand lock, etc.)
│   │   ├── database/     # Supabase client setup
│   │   ├── middleware/   # Auth and other middleware
│   │   ├── routes/       # API route handlers
│   │   └── services/     # Business logic services
│   ├── generated/        # Output PDFs and PowerPoints
│   ├── uploads/          # Temporary file uploads
│   ├── server.js         # Main server file
│   ├── package.json      # Backend dependencies
│   └── .env.local        # Backend environment variables
│
├── frontend/             # React frontend (port 3000)
│   ├── src/             # React source code
│   ├── public/          # Static assets
│   ├── build/           # Production build
│   ├── package.json     # Frontend dependencies
│   └── .env.local       # Frontend environment variables
│
├── tests/               # All test files
├── docs/                # Documentation
├── scripts/             # Utility scripts
├── brand-assets/        # Brand protected assets
└── package.json         # Root package with scripts

```

## Quick Start Commands

From root directory:

```bash
# Install all dependencies
npm run install:all

# Start backend (Terminal 1)
npm run backend

# Start frontend (Terminal 2)
npm run frontend

# Build frontend for production
npm run frontend:build
```

## Environment Files

### Backend: `/backend/.env.local`
- PORT=3001
- GEMINI_API_KEY
- FIRECRAWL_API_KEY
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

### Frontend: `/frontend/.env.local`
- REACT_APP_API_URL=http://localhost:3001

## Key Features
- Clean separation of backend and frontend
- Organized source code in `/src` directories
- Test files isolated in `/tests`
- Documentation in `/docs`
- Utility scripts in `/scripts`
- Protected brand assets properly isolated