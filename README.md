# 🌟 Wealth Management Content Studio
## AI-Powered Training Material Generator with Enterprise Brand Lock System

A comprehensive, full-stack content management platform designed for The Well's wealth management training programs. Built with React, Express, SQLite, and powered by Google Gemini AI and Firecrawl research capabilities.

## 🚀 Core Features

### 📝 **Content Management**
- **Dynamic Content Editor** - Create and edit training materials with drag-and-drop reordering
- **Multi-format Upload** - Support for Word, PDF, Text, Markdown, and CSV files
- **Auto-formatting** - All content automatically styled to brand standards
- **Version Control** - Track content changes and maintain history

### 🤖 **AI Marketing Hub** 
- **Gemini 2.5 Flash Integration** - Generate marketing campaigns and content
- **Multi-channel Support** - LinkedIn, Facebook, Twitter, Instagram, Email
- **Campaign Management** - Track metrics, engagement, and ROI
- **AI Agents** - Automated content creation and optimization

### 🎨 **AI Image Generation Studio**
- **Gemini Vision API** - Generate images from text descriptions
- **Text Overlays** - Add overlay, underlay, or watermark text
- **Brand Application** - Automatic logo placement and color schemes
- **Platform Optimization** - Auto-resize for LinkedIn, Instagram, Facebook, Twitter

### 🔍 **Research & Intelligence**
- **Firecrawl Integration** - Web scraping and content aggregation
- **Trending Topics** - Real-time industry trend analysis
- **Content Conversion** - Transform research into training materials
- **Source Attribution** - Automatic citation and reference tracking

### 📱 **Social Media Optimizer**
- **Platform-Specific Formatting** - Optimize content for each social platform
- **Hashtag Generation** - AI-powered relevant hashtag suggestions
- **Schedule & Publishing** - Plan and schedule content across platforms
- **Engagement Analytics** - Track performance metrics

### 📊 **Document Generation**
- **PDF Export** - Professional PDFs with exact brand styling
- **PowerPoint Creation** - Branded presentation templates
- **Chart Visualizations** - Bar, line, pie, radar, heatmap, sankey, treemap
- **Batch Processing** - Generate multiple documents simultaneously

### 🔒 **Enterprise Brand Lock System**
- **Immutable Design** - Colors, fonts, layouts permanently locked
- **Brand Protection** - Style override attempts blocked and logged
- **Compliance Tracking** - Monitor all brand guideline violations
- **Template Enforcement** - All content uses approved templates

## 🛠 Tech Stack

### Frontend
- **React 19** - Latest React with TypeScript
- **React Router v6** - Client-side routing
- **Lucide React** - Modern icon library
- **Custom CSS** - Dark theme with brand colors

### Backend
- **Express.js** - Node.js web framework
- **SQLite3** - Embedded database
- **Multer** - File upload handling
- **Puppeteer** - PDF generation
- **PptxGenJS** - PowerPoint creation
- **Mammoth** - Word document parsing
- **pdf-parse** - PDF text extraction

### AI & APIs
- **Google Gemini 2.5 Flash** - Content and image generation
- **Firecrawl API** - Web scraping and research
- **OpenAI Compatible** - Support for various AI providers

## 📦 Installation

### System Requirements
- **Node.js** 16.0 or higher
- **npm** 7.0 or higher
- **RAM** 4GB minimum (8GB recommended)
- **Storage** 2GB free space

### Quick Start

1. **Clone the Repository**
```bash
git clone https://github.com/thewell/wealth-content-studio.git
cd wealth-content-studio
```

2. **Setup Environment Variables**
Create `.env.local` files in both frontend and backend directories:

Backend `.env.local`:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
NODE_ENV=development
```

Frontend `.env.local`:
```env
REACT_APP_API_URL=http://localhost:3001
```

3. **Install Dependencies**
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

4. **Initialize Database**
```bash
cd backend
node database/init.js
node database/import-partners.js  # Import partner data
```

5. **Start Development Servers**

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

## 📖 User Guide

### Navigation Overview
The application features 6 main sections accessible via the top navigation bar:

### 1. 📝 **Content Editor**
Create and manage training content with professional templates:
- **Create Sections** - Choose from 6 pre-designed templates (Cover, Executive Summary, Role Description, etc.)
- **Edit Content** - Modify text while maintaining brand styling
- **Drag & Drop** - Reorder sections visually
- **Compensation Details** - Add salary ranges and bonus structures
- **Auto-Save** - Changes persist automatically

### 2. 📤 **Upload Materials**
Import existing training materials seamlessly:
- **Drag & Drop Zone** - Visual upload interface
- **Multi-Format Support** - .docx, .pdf, .txt, .md, .csv
- **Batch Processing** - Upload multiple files simultaneously
- **Auto-Formatting** - Content extracted and styled automatically
- **Progress Tracking** - Real-time upload status

### 3. 📄 **Generate Documents**
Export professional materials with one click:
- **Select Content** - Choose which sections to include
- **PDF Generation** - High-quality PDFs with exact brand styling
- **PowerPoint Export** - Branded slide decks
- **Batch Export** - Generate multiple formats at once
- **Instant Download** - Files ready immediately

### 4. 🔍 **Research**
AI-powered content discovery and curation:
- **Web Search** - Powered by Firecrawl API
- **Trending Topics** - Industry trends and insights
- **Content Conversion** - Transform research into training materials
- **Source Management** - Automatic citations and references

### 5. 📱 **Social Media**
Optimize content for social platforms:
- **Platform Optimization** - LinkedIn, Facebook, Twitter, Instagram
- **Hashtag Suggestions** - AI-generated relevant tags
- **Content Validation** - Check character limits and formatting
- **Schedule Posts** - Plan your content calendar

### 6. 🚀 **AI Marketing Hub**
Complete marketing command center with multiple views:

#### Dashboard View
- Performance metrics and KPIs
- Channel status overview
- Quick content generation

#### Campaigns View
- Create multi-channel campaigns
- Track engagement metrics
- ROI analysis

#### Content View
- AI-powered content creation
- Template library
- Brand compliance checking

#### Templates View
- Pre-designed marketing templates
- Industry-specific formats
- Customizable frameworks

#### Studio View (Image Generation)
- **Describe & Generate** - Text-to-image with Gemini 2.5
- **Text Overlays** - Add headlines, CTAs, watermarks
- **Brand Application** - Automatic logo and color application
- **Platform Sizing** - Auto-optimize for each social platform

#### AI Agents View
- Automated content creation
- Campaign optimization
- Performance analysis

#### Calendar View
- Visual content planning
- Deadline tracking
- Publishing schedule

## 📊 Chart Visualizations

All charts automatically apply brand colors with professional styling:

| Chart Type | Best For | Brand Colors |
|------------|----------|--------------|
| **Bar Charts** | Comparing categories | Gold/Cyan gradients |
| **Line Graphs** | Trends over time | Multi-series with brand palette |
| **Pie/Donut** | Part-to-whole relationships | Segmented brand colors |
| **Radar Charts** | Multi-dimensional comparisons | Transparent overlays |
| **Heatmaps** | Intensity/density visualization | Gold intensity scale |
| **Sankey Diagrams** | Flow and relationships | Gradient flows |
| **Treemaps** | Hierarchical data | Nested brand colors |

## 🔐 Security & Brand Protection

### Brand Lock Features
- **Immutable Styles** - CSS modifications blocked at runtime
- **Template Protection** - Locked components cannot be altered
- **Audit Logging** - All override attempts logged to database
- **Compliance Reports** - Export brand violation reports

### Data Security
- **Input Sanitization** - XSS and injection protection
- **File Validation** - Upload type and size restrictions  
- **API Rate Limiting** - Prevent abuse and overload
- **Session Management** - Secure authentication tokens

## 📁 Project Structure

```
wealth-content-studio/
├── 🔧 backend/
│   ├── api/                      # AI API integrations
│   │   ├── gemini-marketing-ai.js
│   │   └── vision-ai.js
│   ├── config/
│   │   ├── api.js               # API configuration
│   │   └── brandLock.js         # Brand protection rules
│   ├── database/
│   │   ├── schema.sql           # Core database schema
│   │   ├── thewell-schema-extensions.sql
│   │   ├── wealth_training.db   # SQLite database
│   │   └── import-partners.js   # Partner data import
│   ├── routes/
│   │   ├── content.js           # Content CRUD operations
│   │   ├── upload.js            # File upload handling
│   │   ├── generate.js          # PDF/PowerPoint generation
│   │   ├── templates.js         # Template management
│   │   ├── research.js          # Firecrawl integration
│   │   └── social.js            # Social media APIs
│   ├── generated/               # Output documents
│   ├── uploads/                 # Temporary upload storage
│   └── server.js                # Express server entry
│
├── 🎨 frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── locked/          # Protected brand components
│   │   │   │   └── BrandHeader.tsx
│   │   │   ├── ui/              # Reusable UI components
│   │   │   │   ├── Toast.tsx
│   │   │   │   └── Confirm.tsx
│   │   │   ├── ContentEditor.tsx
│   │   │   ├── DocumentPreview.tsx
│   │   │   ├── GeneratePanel.tsx
│   │   │   ├── ImageGenerationStudio.tsx
│   │   │   ├── MarketingDashboard.tsx
│   │   │   ├── ResearchPanel.tsx
│   │   │   ├── SocialMediaOptimizer.tsx
│   │   │   └── UploadManager.tsx
│   │   ├── config/
│   │   │   ├── api.ts           # API configuration
│   │   │   └── brandConfig.ts   # Brand constants
│   │   ├── styles/
│   │   │   ├── brand.locked.css # Immutable brand styles
│   │   │   ├── components.css   # Component styles
│   │   │   └── ImageGenerationStudio.css
│   │   ├── utils/
│   │   │   └── styleManager.ts  # Style enforcement
│   │   ├── App.tsx              # Main application
│   │   └── App.css              # Application styles
│   └── public/
│       └── index.html           # Entry HTML
│
├── 📊 data/
│   └── partners.csv             # Partner firm data
│
├── 📚 docs/
│   └── CLAUDE.md                # AI assistant instructions
│
└── 📋 Config Files
    ├── .env.local               # Environment variables
    ├── .gitignore               # Git ignore rules
    ├── package.json             # Dependencies
    └── README.md                # This file
```

## 🔌 API Reference

### Content Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content` | List all content sections |
| POST | `/api/content` | Create new content |
| PUT | `/api/content/:id` | Update existing content |
| DELETE | `/api/content/:id` | Delete content section |

### File Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/single` | Upload single file |
| POST | `/api/upload/batch` | Upload multiple files |
| GET | `/api/upload/history` | View upload history |

### Document Generation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate/pdf` | Generate PDF document |
| POST | `/api/generate/slides` | Generate PowerPoint |
| GET | `/api/generate/download/:file` | Download generated file |

### AI & Marketing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/generate-campaign` | Generate campaign content |
| POST | `/api/ai/generate-image` | Generate images with Gemini |
| POST | `/api/vision/analyze` | Analyze uploaded images |
| POST | `/api/vision/generate-variations` | Create image variations |

### Research & Social
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/research/trending` | Get trending topics |
| POST | `/api/research/search` | Search web content |
| POST | `/api/research/convert` | Convert research to content |
| POST | `/api/social/optimize` | Optimize for social platforms |
| POST | `/api/social/validate` | Validate content compliance |

### Templates & Brand
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | List locked templates |
| POST | `/api/templates/validate-style` | Check style violations |
| GET | `/api/brand/protection-log` | View override attempts |

## 🛠 Troubleshooting

### Common Issues & Solutions

#### Database Errors
```bash
# Reset database
cd backend
rm database/wealth_training.db
node database/init.js
node database/import-partners.js
```

#### Port Conflicts
```bash
# Backend (change in server.js or use env)
PORT=3002 npm start

# Frontend
PORT=3001 npm start
```

#### API Key Issues
- Verify `.env.local` exists in both frontend and backend
- Check API key format and validity
- Ensure keys have proper permissions

#### Upload Failures
- Check file size (max 10MB default)
- Verify file format is supported
- Clear `backend/uploads/` directory if full

#### Style Override Warnings
```sql
-- Check brand protection log
SELECT * FROM brand_protection_log 
WHERE blocked = 1 
ORDER BY timestamp DESC;
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Build output in frontend/build/
```

### Environment Configuration
Production `.env.local`:
```env
NODE_ENV=production
PORT=3001
GEMINI_API_KEY=your_production_key
FIRECRAWL_API_KEY=your_production_key
DATABASE_PATH=/var/data/wealth_training.db
```

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY . .
RUN npm ci --only=production
EXPOSE 3001
CMD ["node", "backend/server.js"]
```

## 📊 Performance Optimization

### Frontend
- Lazy loading for heavy components
- Image optimization with WebP format
- Code splitting by route
- CSS minification in production

### Backend
- Database indexing on frequently queried columns
- Redis caching for API responses (optional)
- CDN for static assets
- Compression middleware enabled

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Standards
- ESLint configuration enforced
- Prettier for code formatting
- TypeScript strict mode
- 90% test coverage requirement

## 📜 License

This project is proprietary software owned by The Well.
- Brand assets are protected trademarks
- Code is confidential and proprietary
- Unauthorized use is prohibited

## 💡 Key Reminders

### ⚠️ Protected Files (DO NOT MODIFY)
- `components/locked/*` - Immutable brand components
- `brand.locked.css` - Protected style definitions
- `brandLock.js` - Brand enforcement configuration
- Database template records

### ✅ Modifiable Content
- Text content in all sections
- Data values and metrics
- Chart data and labels
- Document titles and descriptions
- Upload file processing logic

## 📞 Support & Contact

- **Technical Issues**: tech-support@thewell.com
- **Brand Guidelines**: brand@thewell.com
- **Feature Requests**: product@thewell.com

---

**Built with 💛 by The Well** | Maintaining Excellence in Wealth Management Training

*Version 2.0.0 | Last Updated: January 2025*
