# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wealth Management Content Studio - An AI-powered training material generator with enterprise brand lock system. Full-stack application with React frontend, Express backend, SQLite database, and integrations with Google Gemini AI and Firecrawl for research.

## Commands

### Development Workflow

**Start the full application (requires 2 terminals):**
```bash
# Terminal 1 - Backend (port 3001)
cd backend && npm start

# Terminal 2 - Frontend (port 3000)  
cd backend/frontend && npm start
```

**Initialize/Reset Database:**
```bash
cd backend
node database/init.js
node database/import-partners.js  # Import partner firm data
```

**Build Production Frontend:**
```bash
cd backend/frontend && npm run build
```

**Generate PDF from Static Report:**
```bash
node generate-pdf.js  # Creates PDF from wealth-roles-2025-spaced.html
```

## Architecture

### Directory Structure

- `/backend` - Express server (port 3001)
  - `/api` - AI integrations (Gemini marketing, vision, agents)
  - `/database` - SQLite database and schema
  - `/routes` - API endpoints
  - `/generated` - Output PDFs and PowerPoints
  - `/uploads` - Temporary file storage

- `/backend/frontend` - React application (port 3000)
  - `/src/components` - React components
  - `/src/components/locked` - Protected brand components
  - `/src/config` - API and brand configuration
  - `/src/styles` - CSS including locked brand styles

### Key API Routes

**Content Management:**
- `/api/content` - CRUD operations for training content
- `/api/upload` - File processing (Word, PDF, Markdown, CSV)
- `/api/generate` - PDF/PowerPoint generation
- `/api/templates` - Locked brand templates

**AI & Marketing:**
- `/api/ai/generate-campaign` - Generate marketing campaigns
- `/api/ai/generate-image` - Image generation with Gemini
- `/api/vision/analyze` - Image analysis
- `/api/ai-agents/*` - Various AI agent endpoints

**Research & Social:**
- `/api/research` - Firecrawl integration for web research
- `/api/social` - Social media optimization
- `/api/partners` - Partner firm management

### Database Schema

Core tables in `wealth_training.db`:
- `content` - Training material sections with JSON content_data
- `templates` - Locked presentation templates (immutable)
- `uploads` - Processed file tracking  
- `generated_documents` - Output file tracking
- `partners` - Partner firm information
- `campaigns`, `campaign_content` - Marketing campaign data
- `brand_protection_log` - Style override attempts

### Brand Lock System

**Protected Files (DO NOT MODIFY):**
- `/backend/frontend/src/components/locked/*` - Immutable brand components
- `/backend/frontend/src/styles/brand.locked.css` - Protected styles
- `/backend/config/brandLock.js` - Brand enforcement rules

**Brand Colors:**
- Black primary
- Gold: #BE9E44 / #D4AF37
- Cyan: #2EA3F2 / #4FC3F7

All style overrides are blocked and logged to `brand_protection_log` table.

### Environment Configuration

Create `.env.local` files:

**Backend (`/backend/.env.local`):**
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

**Frontend (`/backend/frontend/.env.local`):**
```env
REACT_APP_API_URL=http://localhost:3001
```

## Key Integration Points

### AI Features
- **Gemini 2.5 Flash** - Content generation, image creation
- **Firecrawl API** - Web scraping when API key is set
- Falls back to mock data if APIs unavailable

### Document Generation
- **PDF**: Uses Puppeteer with brand templates
- **PowerPoint**: Uses PptxGenJS with enforced colors
- Generated files stored in `/backend/generated/`

### Upload Processing
- Supports: .docx, .pdf, .txt, .md, .csv
- Strips all styling, applies brand templates
- Uses Mammoth for Word, pdf-parse for PDF

## Development Guidelines

### Adding Features
1. Content changes go through database - never modify templates directly
2. All components must use `brandConfig` for styling
3. Style attributes in user content are automatically sanitized
4. Research content must be cleaned before display (use `cleanContent`)

### Testing Workflows
1. **Upload**: Test with sample Word/PDF files
2. **Brand Lock**: Attempt style changes, check `brand_protection_log`
3. **Generation**: Verify PDFs maintain exact styling
4. **Research**: Test with/without Firecrawl API key

### Common Issues
- **Port conflicts**: Backend uses 3001, Frontend uses 3000
- **Database locked**: Stop server, delete `.db` file, run `init.js`
- **CORS errors**: Ensure backend is running before frontend
- **Style overrides**: Check console and database logs