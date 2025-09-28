# Landing Page Development Tasks

Based on `design_document.json` and PRD v2.2 for Aksara Legal AI MVP.

This tracks the components and sections needed for the landing page (`app/page.tsx`) to align with the demo script and user flow.

## Overview
- **Goal**: Create a marketing-focused landing page that hooks users with the problem, showcases the solution, and drives sign-ups.
- **Key Sections**: Hero, Problem, Solution, How It Works, CTA, Footer.
- **Design System**: Use Tailwind classes from `design_system.json` (e.g., `bg-primary`, `font-heading`).
- **Responsive**: Mobile-first, using grid breakpoints.
- **Content**: Bahasa Indonesia primary, encouraging tone.

## Tasks

### 1. Hero Section
- [x] Create hero component with headline ("Aksara Legal AI: Legal Co-Pilot untuk UMKM & Startup"), subheadline, key quote, and CTA button ("Mulai Sekarang" → `/register`).
- [x] Style with Anton font for headline, light gray background, primary button.
- [x] Add subtle illustration (e.g., document icons).

### 2. Problem Section
- [ ] Build problem cards/cards for complexity, administrative burden, budget constraints.
- [ ] Include Sari Dewi persona teaser.
- [ ] Use secondary background, neutral text, shadow-card.

### 3. Solution Section
- [ ] Implement three-pillar cards: Checklist Generator, AI Q&A, Aksara Autopilot.
- [ ] Bento grid layout with icons and descriptions.
- [ ] Highlight 80% time savings.

### 4. How It Works Section
- [ ] Create step-by-step timeline/cards: Register → Profile → Checklist → AI Chat → Generate Docs → Upgrade.
- [ ] Use responsive grid, success badges.

### 5. Call-to-Action Section
- [ ] Add CTA with title, subtext, "Daftar Gratis" and "Masuk" buttons.
- [ ] Primary background, white text.

### 6. Footer
- [ ] Simple footer with links (Dashboard, Documents, Pricing), branding, and placeholders for legal.
- [ ] Secondary background.

### 7. Integration & Polish
- [ ] Ensure responsive design across breakpoints.
- [ ] Add accessibility (ARIA labels, contrast).
- [ ] Test performance (fast load).
- [ ] Link to backend if dynamic content needed (e.g., pricing preview).

## Progress Tracking
- Start with Hero Section.
- Mark tasks as complete with [x] after implementation.
- Test each section in browser (`npm run dev`).

## Notes
- Align with user stories US-01 to US-04 for onboarding flow.
- Reference `component_library` in `design_system.json` for atoms/molecules/organisms.
- If backend integration is needed, use REST endpoints from `integration_contracts`.</content>
<parameter name="filePath">/home/dzikran/lomba/Aksara-Legal-AI/frontend/landing_page_tasks.md