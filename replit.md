# ArabyWeb.ai

AI-powered website builder SaaS platform targeting the Saudi and Arab market. Users describe their website and AI generates professional, responsive websites instantly. Supports bilingual (Arabic RTL + English LTR).

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion + Wouter routing
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)
- **Auth**: Replit Auth (OpenID Connect — supports Google, GitHub, email)

## Key Features

- Landing page with bilingual support (Arabic default, English toggle) and Saudi market marketing
- Google authentication via Replit Auth (no custom login forms)
- Dashboard with project management
- AI website generation from text descriptions
- AI-powered editing via chat commands
- Live preview with responsive viewport switching (desktop/tablet/mobile)
- Template marketplace (6 templates)
- Publish system
- Green/teal brand color scheme

## File Structure

### Shared
- `shared/schema.ts` - Drizzle schemas for projects, templates (re-exports users from models/auth)
- `shared/models/auth.ts` - Replit Auth users and sessions tables

### Server
- `server/index.ts` - Express server entry point
- `server/routes.ts` - API routes for projects, templates (uses Replit Auth middleware)
- `server/storage.ts` - Database storage layer (IStorage interface)
- `server/ai.ts` - OpenAI integration for website generation and editing
- `server/seed.ts` - Database seeding with template data
- `server/db.ts` - Database connection
- `server/replit_integrations/auth/` - Replit Auth module (OIDC, sessions, user storage)

### Client
- `client/src/App.tsx` - Main app with routing and ProtectedRoute
- `client/src/hooks/use-auth.ts` - Replit Auth React hook
- `client/src/lib/auth.tsx` - Auth context provider with language management (wraps useAuth hook)
- `client/src/lib/auth-utils.ts` - Auth error utilities
- `client/src/lib/i18n.ts` - Translation system (EN/AR) with Saudi marketing copy
- `client/src/pages/landing.tsx` - Landing page with Saudi market focus
- `client/src/pages/dashboard.tsx` - Project management dashboard
- `client/src/pages/editor.tsx` - Website editor with AI generation
- `client/src/pages/preview.tsx` - Full-screen website preview
- `client/src/pages/templates.tsx` - Template marketplace
- `client/src/components/dashboard-layout.tsx` - Sidebar layout for dashboard
- `client/src/components/language-toggle.tsx` - EN/AR language toggle

## Database Tables

- `users` - id (varchar, OIDC sub), email, firstName, lastName, profileImageUrl, createdAt, updatedAt
- `sessions` - sid (varchar PK), sess (jsonb), expire (timestamp)
- `projects` - id (serial), userId (varchar), name, description, status, templateId, generatedHtml, generatedCss, seoTitle, seoDescription, colorPalette (jsonb), sections (jsonb), createdAt, updatedAt
- `templates` - id (serial), name, nameAr, description, descriptionAr, category, thumbnail, previewHtml, previewCss, isPremium, createdAt

## API Routes

- `GET /api/login` - Begin Replit Auth login flow (Google, etc.)
- `GET /api/logout` - Logout and end session
- `GET /api/callback` - OIDC callback
- `GET /api/auth/user` - Get current authenticated user
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

## Pricing (Saudi Riyals)

- Free: مجاناً (1 website)
- Pro: ٤٩ ر.س/month (10 websites)
- Business: ٩٩ ر.س/month (unlimited)

## Language Default

- Default language: Arabic (ar)
- localStorage key: `arabyweb-lang`
