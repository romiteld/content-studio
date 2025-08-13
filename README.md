# Content Studio
## With Locked Brand Design System

A professional training material generator that maintains immutable brand consistency while allowing content flexibility.

## Key Features

### 🔒 **Locked Brand System**
- **Immutable Design**: All visual elements (colors, fonts, layouts) are permanently locked
- **Brand Protection**: Style overrides are automatically blocked and logged
- **Consistent Output**: Every generated document maintains exact brand standards

### ✅ **What Your Boss CAN Do**
- Edit text content and data values
- Upload training materials (Word, PDF, Markdown, CSV)
- Choose from enhanced chart visualizations
- Generate professional PDFs and PowerPoint presentations
- Reorder and manage content sections

### ❌ **What is LOCKED (Cannot Change)**
- Logo position and size
- Color scheme (Black, Gold #BE9E44, Cyan #2EA3F2)
- Font system (Inter family)
- Component layouts and spacing
- All visual styling elements

## Installation & Setup

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Quick Start

1. **Install Backend Dependencies**
```bash
cd backend
npm install
```

2. **Initialize Database**
```bash
cd backend
node database/init.js
```

3. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

4. **Start the Application**

Terminal 1 - Backend:
```bash
cd backend
npm start
# Server runs on http://localhost:3001
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
# App opens at http://localhost:3000
```

## How to Use

### 1. **Content Editor Tab**
- Create new content sections using locked templates
- Edit only text and data (styling is automatic)
- Manage compensation details for roles
- Reorder sections with display order

### 2. **Upload Materials Tab**
- Drag & drop training materials
- Supported formats: .docx, .pdf, .txt, .md, .csv
- Content is automatically extracted and formatted
- All uploaded styles are stripped and replaced with brand templates

### 3. **Generate Documents Tab**
- Select content sections to include
- Generate professional PDFs with exact brand styling
- Create PowerPoint presentations with locked colors
- Download generated documents instantly

## Enhanced Chart Options

Your boss can request better visualizations while maintaining brand colors:

- **Bar Charts**: Gold/cyan gradients
- **Line Graphs**: Brand-colored trends
- **Pie/Donut Charts**: Segmented data
- **Radar Charts**: Multi-dimensional analysis
- **Heatmaps**: Intensity visualization
- **Sankey Diagrams**: Flow visualization
- **Treemaps**: Hierarchical data

All charts automatically apply brand colors - no manual styling needed.

## Project Structure

```
wealth/
├── backend/
│   ├── config/
│   │   └── brandLock.js      # Immutable brand configuration
│   ├── database/
│   │   ├── schema.sql        # Content-only database
│   │   └── wealth_training.db
│   ├── routes/
│   │   ├── content.js        # Content management
│   │   ├── upload.js         # File processing
│   │   ├── generate.js       # PDF/PowerPoint generation
│   │   └── templates.js      # Locked templates
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── locked/       # Immutable UI components
│   │   │   ├── ContentEditor.tsx
│   │   │   ├── UploadManager.tsx
│   │   │   └── GeneratePanel.tsx
│   │   ├── styles/
│   │   │   └── brand.locked.css  # Protected styles
│   │   └── App.tsx
│   └── public/
│       └── logo.png          # Brand logo
│
└── brand-assets/
    └── protected/            # Protected brand elements
        └── logo.png

```

## Security Features

### Brand Protection Log
All attempts to modify styles are logged in the database:
- Style override attempts
- Unauthorized modifications
- Template tampering

### Content Sanitization
- All user input is sanitized
- Style attributes are automatically removed
- Only text and data values are preserved

## API Endpoints

### Content Management
- `GET /api/content` - List all content
- `POST /api/content` - Create new content (text only)
- `PUT /api/content/:id` - Update content (text only)
- `DELETE /api/content/:id` - Delete content

### Upload Processing
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/batch` - Upload multiple files
- `GET /api/upload/history` - View upload history

### Document Generation
- `POST /api/generate/pdf` - Generate PDF
- `POST /api/generate/slides` - Generate PowerPoint
- `GET /api/generate/download/:filename` - Download file

### Templates (Read-Only)
- `GET /api/templates` - List locked templates
- `POST /api/templates/validate-style` - Check for style violations

## Troubleshooting

### Database Issues
```bash
cd backend
rm database/wealth_training.db
node database/init.js
```

### Port Conflicts
- Backend: Change port in `backend/server.js`
- Frontend: Use `PORT=3001 npm start`

### Style Override Attempts
Check the brand protection log:
```sql
SELECT * FROM brand_protection_log WHERE blocked = 1;
```

## Important Notes

⚠️ **DO NOT MODIFY**:
- Any files in `components/locked/`
- The `brand.locked.css` file
- The `brandLock.js` configuration
- Database template records

✅ **SAFE TO MODIFY**:
- Content text and data
- Display order of sections
- Chart data values
- Document titles

## Support

For issues with the locked brand system, check:
1. Brand protection logs in database
2. Console for style override warnings
3. Network tab for blocked requests

Remember: The design system is intentionally immutable to maintain brand consistency across all generated materials.
