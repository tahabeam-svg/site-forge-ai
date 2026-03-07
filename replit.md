# SiteForge AI

AI-powered website builder SaaS platform. Users describe their website and AI generates professional, responsive websites instantly.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion + Wouter routing
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI via Replit AI Integrations (no API key needed)
- **Auth**: Passport.js with local strategy (session-based)

## Key Features

- Landing page with bilingual support (English/Arabic with RTL)
- User authentication (register/login)
- Dashboard with project management
- AI website generation from text descriptions
- AI-powered editing via chat commands
- Live preview with responsive viewport switching
- Template marketplace
- Publish system

## File Structure

### Shared
- `shared/schema.ts` - Drizzle schemas for users, projects, templates, conversations, messages

### Server
- `server/index.ts` - Express server entry point
- `server/routes.ts` - API routes for projects, templates, auth
- `server/storage.ts` - Database storage layer (IStorage interface)
- `server/auth.ts` - Passport.js authentication setup
- `server/ai.ts` - OpenAI integration for website generation and editing
- `server/seed.ts` - Database seeding with template data
- `server/db.ts` - Database connection

### Client
- `client/src/App.tsx` - Main app with routing
- `client/src/lib/auth.tsx` - Auth context provider with language management
- `client/src/lib/i18n.ts` - Translation system (EN/AR)
- `client/src/pages/landing.tsx` - Landing page
- `client/src/pages/auth.tsx` - Login/Register page
- `client/src/pages/dashboard.tsx` - Project management dashboard
- `client/src/pages/editor.tsx` - Website editor with AI generation
- `client/src/pages/preview.tsx` - Full-screen website preview
- `client/src/pages/templates.tsx` - Template marketplace
- `client/src/components/dashboard-layout.tsx` - Sidebar layout for dashboard
- `client/src/components/language-toggle.tsx` - EN/AR language toggle

## Database Tables

- `users` - id (serial), username, password, displayName, language, createdAt
- `projects` - id (serial), userId, name, description, status, templateId, generatedHtml, generatedCss, seoTitle, seoDescription, colorPalette (jsonb), sections (jsonb), createdAt, updatedAt
- `templates` - id (serial), name, nameAr, description, descriptionAr, category, thumbnail, previewHtml, previewCss, isPremium, createdAt

## API Routes

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `GET /api/projects` - List user projects
- `GET /api/projects/:id` - Get project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/generate` - Generate website with AI
- `POST /api/projects/:id/edit` - Edit website with AI command
- `POST /api/projects/:id/publish` - Publish project
- `GET /api/templates` - List templates
- `GET /api/templates/:id` - Get template
