# ArabyWeb.net

AI-powered website builder SaaS platform targeting the Saudi and Arab market. Users describe their website and AI generates professional, responsive websites instantly. Supports bilingual (Arabic RTL + English LTR).

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion + Wouter routing
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)
- **Auth**: Email/password (bcryptjs) + Google OAuth (passport-google-oauth20), session-based with memorystore

## Key Features

- Landing page with bilingual support (Arabic default, English toggle) and Saudi market marketing
- Email/password registration and login + Google OAuth
- Dashboard with project management
- AI website generation from text descriptions with stock images (Unsplash)
- AI-powered editing via chat commands with conversation history
- Live preview with responsive viewport switching (desktop/tablet/mobile)
- Template marketplace (400 templates — 20 per category across 20 categories: corporate, ecommerce, exhibition, restaurant, startup, portfolio, medical, realestate, marketing, consulting, education, construction, logistics, beauty, fitness, travel, automotive, legal, nonprofit, localservices; Arabic-first with Cairo/Tajawal/IBM Plex Arabic fonts, Unsplash hero images, full-page templates with navbar, hero, services, gallery, testimonials, contact form, footer)
- File upload system (images, logos, SVG)
- Media embedding (YouTube/Vimeo) via AI chat
- Enhanced editor with 4 tabs: Chat, Sections, Media, Style
- Section management (add Hero, About, Services, Gallery, Contact, FAQ, Team, Pricing)
- Font system: Cairo, Tajawal, IBM Plex Arabic (Arabic) + Inter, Poppins, Montserrat (English)
- Color scheme picker with presets
- Quick style commands
- Billing & subscription page with pricing plans
- Admin dashboard with user/project management, stats, and coupon system
- AI Social Media Marketing tool (generate posts for Instagram, Facebook, LinkedIn, Twitter, TikTok, YouTube)
- Coupon system (admin creates discount codes with percentage/fixed, expiry, usage limits)
- Settings page (profile, language, preferences)
- Analytics page (project stats, traffic overview, activity)
- Domains page (custom domain management, DNS instructions)
- Payment Methods page (add/remove cards, set default, Mada/Apple Pay support)
- Website export/download as ZIP (static HTML/CSS with bilingual README)
- Deploy guide page (/deploy-guide/:id) with step-by-step hosting instructions for non-technical users (Netlify, Vercel, GitHub Pages, Hostinger, cPanel, manual)
- GitHub deployment integration (push to GitHub repo, with Hostinger connection guide)
- Image/logo upload directly in AI chat conversation (with preview and instructions)
- Publish system
- Hidden admin panel (accessible only via direct URL /admin or /secure-admin, not in sidebar)
- Marketing services section on landing page with tiered pricing
- Green/teal brand color scheme

## File Structure

### Shared
- `shared/schema.ts` - Drizzle schemas for projects, templates, chatMessages, coupons (re-exports users from models/auth)
- `shared/models/auth.ts` - Users table with password and Google OAuth fields

### Server
- `server/index.ts` - Express server entry point
- `server/routes.ts` - API routes for projects, templates, file upload, admin, coupons, AI marketing, payments
- `server/storage.ts` - Database storage layer (IStorage interface with coupon CRUD, settings, subscriptions)
- `server/ai.ts` - OpenAI integration for website generation, editing, and social media content
- `server/paymob.ts` - Paymob Accept payment gateway integration (auth, orders, payment keys, HMAC verification)
- `server/seed.ts` - Database seeding with template data
- `server/db.ts` - Database connection
- `server/replit_integrations/auth/` - Auth module (email/password + Google OAuth, passport.js, session-based)
- `uploads/` - File upload directory for user-uploaded images/logos

### Client
- `client/src/App.tsx` - Main app with routing and ProtectedRoute
- `client/src/hooks/use-auth.ts` - Auth React hook (session-based)
- `client/src/lib/auth.tsx` - Auth context provider with language management
- `client/src/pages/auth.tsx` - Login/register page (email/password + Google OAuth)
- `client/src/lib/auth-utils.ts` - Auth error utilities
- `client/src/lib/i18n.ts` - Translation system (EN/AR) with Saudi marketing copy
- `client/src/pages/landing.tsx` - Landing page with Saudi market focus
- `client/src/pages/dashboard.tsx` - Project management dashboard
- `client/src/pages/editor.tsx` - Website editor with AI generation, chat, sections, media, style tabs
- `client/src/pages/preview.tsx` - Full-screen website preview
- `client/src/pages/templates.tsx` - Template marketplace
- `client/src/pages/billing.tsx` - Billing & subscription management (connected to Paymob)
- `client/src/pages/admin.tsx` - Admin dashboard with stats, users, projects, coupons, payments, Paymob settings
- `client/src/pages/ai-marketing.tsx` - AI social media marketing tool
- `client/src/pages/settings.tsx` - User settings and preferences
- `client/src/pages/analytics.tsx` - Analytics and usage metrics
- `client/src/pages/domains.tsx` - Domain management
- `client/src/pages/payment-methods.tsx` - Payment methods management
- `client/src/components/dashboard-layout.tsx` - Sidebar layout for dashboard
- `client/src/pages/github-deploy.tsx` - GitHub deployment and Hostinger guide
- `client/src/pages/deploy-guide.tsx` - Step-by-step deployment guide for non-technical users
- `client/src/components/language-toggle.tsx` - EN/AR language toggle

## Database Tables

- `users` - id (varchar, UUID), email, password (bcrypt hash), firstName, lastName, profileImageUrl, googleId, isAdmin, credits (integer, default 5), plan (varchar, default 'free'), githubToken, githubUsername, createdAt, updatedAt
- `sessions` - sid (varchar PK), sess (jsonb), expire (timestamp)
- `projects` - id (serial), userId (varchar), name, description, status, templateId, generatedHtml, generatedCss, seoTitle, seoDescription, colorPalette (jsonb), sections (jsonb), createdAt, updatedAt
- `templates` - id (serial), name, nameAr, description, descriptionAr, category, thumbnail, previewHtml, previewCss, isPremium, createdAt
- `chat_messages` - id (serial), projectId (integer), role (text), content (text), createdAt
- `coupons` - id (serial), code (text, unique), discountType (text), discountValue (integer), maxUses (integer), usedCount (integer), expiresAt (timestamp), isActive (boolean), createdAt
- `platform_settings` - id (serial), key (varchar, unique), value (text), updatedAt
- `subscriptions` - id (serial), userId (varchar), plan (varchar), status (varchar), paymobOrderId, paymobTransactionId, amountCents, currency, startDate, endDate, createdAt

## API Routes

- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Begin Google OAuth flow
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/user` - Get current authenticated user
- `POST /api/auth/logout` - Logout and end session
- `GET /api/projects` - List user projects
- `GET /api/projects/:id` - Get project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/generate` - Generate website with AI
- `POST /api/projects/:id/edit` - Edit website with AI command
- `POST /api/projects/:id/publish` - Publish project
- `GET /api/projects/:id/messages` - Get chat history for project
- `POST /api/upload` - Upload files (images/logos)
- `GET /api/templates` - List templates
- `GET /api/templates/:id` - Get template
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/projects` - List all projects
- `GET /api/admin/coupons` - List all coupons
- `POST /api/admin/coupons` - Create coupon
- `DELETE /api/admin/coupons/:id` - Delete coupon
- `PATCH /api/admin/coupons/:id` - Update coupon
- `PATCH /api/admin/users/:id/suspend` - Suspend user
- `POST /api/marketing/generate` - Generate social media content with AI
- `GET /api/payments/config` - Check if Paymob is configured
- `GET /api/subscription` - Get current user subscription
- `POST /api/payments/initiate` - Start payment flow (returns Paymob iframe URL)
- `POST /api/payments/callback` - Paymob webhook callback
- `GET /api/payments/status/:orderId` - Check payment status
- `GET /api/admin/settings/paymob` - Get Paymob settings (masked)
- `PUT /api/admin/settings/paymob` - Save Paymob settings
- `GET /api/admin/subscriptions` - List all subscriptions
- `GET /api/projects/:id/export` - Export/download project as ZIP file
- `POST /api/github/connect` - Connect GitHub account (with Personal Access Token)
- `POST /api/github/disconnect` - Disconnect GitHub account
- `GET /api/github/user` - Get connected GitHub user info (per-user token)
- `GET /api/github/repos` - List user's GitHub repositories (per-user token)
- `POST /api/github/repos` - Create new GitHub repository (per-user token)
- `POST /api/github/deploy/:projectId` - Push project website to GitHub repo (per-user token)

## Pricing (Credits System)

- Free: 5 credits/month (1 website)
- Pro: 49 SAR/month — 50 credits/month (up to 10 websites, up to 50 marketing posts)
- Business: 99 SAR/month — 200 credits/month (up to 50 websites, up to 100 marketing posts)
- Yearly billing: 20% discount (Pro: 470 SAR/year, Business: 950 SAR/year)

Credits usage: 1 credit per AI generation, 1 per AI edit, 1 per AI marketing post

## Language Default

- Default language: Arabic (ar)
- localStorage key: `arabyweb-lang`
