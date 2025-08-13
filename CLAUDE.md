# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a wealth management training material generator with two main components:
1. **Full-stack web application** - React frontend + Express backend for dynamic content management
2. **Static HTML reports** - Standalone wealth management role guides with PDF generation

## Commands

### Development Workflow

**Start the full application (requires 2 terminals):**
```bash
# Terminal 1 - Backend (port 3001)
cd backend && npm start

# Terminal 2 - Frontend (port 3000)
cd frontend && npm start
```

**Initialize/Reset Database:**
```bash
cd backend
node database/init.js
```

**Build Production Frontend:**
```bash
cd frontend && npm run build
```

**Generate PDF from Static Report:**
```bash
node generate-pdf.js  # Creates PDF from wealth-roles-2025-spaced.html
```

## Architecture

### Full-Stack Application Structure

**Backend (`/backend`)**
- Express server on port 3001
- SQLite database (`wealth_training.db`)
- Key routes:
  - `/api/content` - CRUD operations for training content
  - `/api/upload` - File processing (Word, PDF, Markdown, CSV)
  - `/api/generate` - PDF/PowerPoint generation
  - `/api/research` - Content research and trending topics
  - `/api/social` - Social media optimization
  - `/api/templates` - Locked brand templates

**Frontend (`/frontend`)**
- React 19 with TypeScript
- Components organized by function:
  - Core panels: `ContentEditor`, `UploadManager`, `GeneratePanel`, `ResearchPanel`, `SocialMediaOptimizer`
  - Locked brand components in `/components/locked/`
- Brand styles in `/styles/brand.locked.css` (immutable)

### Brand Lock System

**Immutable Design Elements:**
- Colors: Black primary, Gold (#BE9E44/#D4AF37), Cyan (#2EA3F2/#4FC3F7)
- Fonts: Inter family only
- Layout patterns defined in `brandLock.js`
- All style overrides are blocked and logged to `brand_protection_log` table

**Configuration:**
- Backend: `/backend/config/brandLock.js`
- Frontend: `/frontend/src/config/brandConfig.ts`
- Styles: `/frontend/src/styles/brand.locked.css`

### Database Schema

**Core Tables:**
- `content` - Training material sections with JSON content_data
- `templates` - Locked presentation templates
- `upload_history` - Processed file tracking
- `brand_protection_log` - Style override attempts
- `social_connections` - Platform integrations
- `generated_documents` - Output file tracking

### Key Integration Points

**Research Feature:**
- Uses Firecrawl API when `FIRECRAWL_API_KEY` is set in `.env.local`
- Falls back to mock data if API unavailable
- Converts research to content via `/api/research/convert`

**Document Generation:**
- PDF: Uses Puppeteer with brand-locked templates
- PowerPoint: Uses PptxGenJS with enforced brand colors
- All generated files stored in `/backend/generated/`

**Upload Processing:**
- Supported formats: .docx, .pdf, .txt, .md, .csv
- Strips all styling, applies brand templates
- Uses Mammoth for Word, pdf-parse for PDF

### Static Reports

**Files:**
- `wealth-roles-2025.html` - Main report (view directly in browser)
- `wealth-roles-2025-spaced.html` - Print-optimized for PDF
- `generate-pdf.js` - Puppeteer script for PDF generation

**Structure:**
- 10-page report with embedded CSS
- No external dependencies or CDN usage
- Print-specific CSS with `@page` rules
- CSS custom properties for theming

## Development Guidelines

### When Adding Features
1. Content changes go through database - never modify templates directly
2. All new components must import and use `brandConfig`
3. Style attributes in user content are automatically sanitized
4. Research content must be cleaned before display (use `cleanContent` function)

### Environment Variables
Always use `.env.local` files (frontend/backend roots):
- `FIRECRAWL_API_KEY` - For research API
- `PORT` - Override default ports if needed

### Testing Workflows
1. Upload functionality: Test with sample Word/PDF files
2. Brand lock: Attempt style changes and check `brand_protection_log`
3. Generation: Verify PDFs maintain exact styling
4. Research: Test with/without Firecrawl API key

### Common Issues
- Port conflicts: Backend uses 3001, Frontend uses 3000
- Database locked: Stop server, delete `.db` file, run `init.js`
- Style override attempts: Check console and database logs
- CORS errors: Ensure backend is running before frontend