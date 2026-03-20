# ArabyWeb.net

## Overview

ArabyWeb.net is an AI-powered SaaS platform designed for the Saudi and Arab markets, enabling users to generate professional, responsive, and bilingual (Arabic RTL + English LTR) websites instantly from a text description. The platform aims to simplify website creation, offering a comprehensive suite of tools from AI generation and editing to template marketplaces, custom domains, and social media marketing. It focuses on delivering an Arabic-first user experience with culturally relevant design elements and marketing. The business vision is to become the leading AI website builder in the MENA region, empowering individuals and small businesses to establish an online presence efficiently.

## User Preferences

The user prefers an iterative development approach, asking for confirmation before making any significant architectural or design changes. The user also prefers to be communicated with using clear and concise language, avoiding jargon where possible. They prioritize a well-structured and maintainable codebase, favoring established design patterns and best practices.

## System Architecture

The platform follows a modern web architecture:
-   **Frontend**: React with Vite, Tailwind CSS for styling, Framer Motion for animations, and Wouter for routing.
-   **Backend**: Express.js server developed in TypeScript.
-   **Database**: PostgreSQL managed with Drizzle ORM.
-   **AI Integration**: Utilizes OpenAI (GPT-4o-mini for content generation) via Replit AI Integrations for core website generation and editing.
-   **Authentication**: Supports email/password (bcryptjs) and Google OAuth (passport-google-oauth20) with session-based management using memorystore.

**Key Architectural Decisions and Features:**
-   **Bilingual Support**: Core to the platform, supporting Arabic (RTL) and English (LTR) throughout, from the UI to generated website content.
-   **AI Website Generation**: A two-stage pipeline where AI (GPT-4o-mini) generates structured bilingual content JSON, and a TypeScript engine builds premium HTML with correct CSS Grid, RTL, and integrated language toggles. Images are dynamically injected from Unsplash/Pexels.
-   **Template Marketplace**: Offers 400 Arabic-first templates across 20 categories, featuring appropriate fonts (Cairo, Tajawal, IBM Plex Arabic) and culturally relevant imagery.
-   **Enhanced Editor**: Features Chat for AI interaction, Sections for content management, Media for uploads, and Style for design adjustments.
-   **Design System**: Employs an emerald/teal brand color (`--primary: 160 84% 39%`), premium button design with 3D depth, and real CSS shadows for a polished UI/UX.
-   **AI Industry Engine**: Automatically detects industry from user prompts and enriches generation with industry-specific content, SEO hints, and design moods.
-   **Self-Learning Platform**: Tracks generation attempts and user interactions to improve AI output and identify popular components.
-   **Admin Features**: Includes a hidden admin panel for managing users, projects, coupons, payments, and platform settings.
-   **Deployment & Export**: Users can export websites as ZIP files or deploy directly to GitHub, with guides for various hosting providers.
-   **Payment Gateway**: Integrated with Paymob Accept for subscriptions and credit purchases, supporting Mada/Apple Pay.
-   **Credit-Based System**: A flexible pricing model where users consume credits for AI generations, edits, and AI marketing posts, with different allowances for Free, Pro, and Business plans.
-   **Website Language Support**: Supports 7 languages (ar, en, fr, tr, ru, de, zh) for generated websites, with Arabic as the default.

## External Dependencies

-   **OpenAI**: For AI-powered website generation, editing, and social media content creation.
-   **Unsplash/Pexels APIs**: Used to inject images into generated websites.
-   **Google OAuth**: For user authentication.
-   **Paymob Accept**: Payment gateway for handling subscriptions and credit purchases.
-   **GitHub API**: For connecting user GitHub accounts and deploying websites to repositories.