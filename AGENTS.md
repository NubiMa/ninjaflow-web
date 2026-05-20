# Ninja — Engineering Rules

# Tech Stack

## Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- shadcn/ui

## Backend

- Firebase Auth
- Cloud Firestore
- Firebase Storage
- Firebase Cloud Functions
- Google Cloud Run

## AI

- Gemini API
- Google AI Studio

---

# Architecture Philosophy

Architecture should be:

- scalable
- modular
- lightweight
- maintainable
- fast to iterate

Avoid:

- overengineering
- premature abstractions
- unnecessary enterprise patterns
- complex backend architecture

---

# Folder Structure Philosophy

Keep structure:

- simple
- scalable
- predictable

Separate:

- ui components
- business logic
- AI services
- Firebase services
- utilities

---

# AI System Architecture

Use separated AI pipelines.

## Insight AI

Purpose:

- financial reflection
- spending summaries
- behavior insights

Model preference:

- Gemini Flash

Characteristics:

- lightweight
- text-only
- low token usage

---

## Vision AI

Purpose:

- receipt scanning
- OCR extraction
- transaction parsing

Characteristics:

- multimodal
- image processing
- higher token usage

IMPORTANT:

- use separate API key/token from insight AI
- isolate quota usage

---

# AI Cost Optimization

Always:

- minimize prompts
- summarize context
- compress images before upload
- avoid long conversation memory
- cache repeated responses
- use AI only when needed

Avoid:

- sending full transaction history
- unnecessary AI calls
- verbose prompts
- AI for deterministic logic

---

# Receipt Scanner Rules

Workflow:

1. upload image
2. compress image
3. send to AI
4. extract receipt data
5. generate editable transaction draft
6. user confirms
7. save transaction

Never:

- auto save without confirmation
- upload full-resolution image unnecessarily

---

# Categorization Rules

Prefer:

- rule-based categorization first
- AI fallback second

Example:

- McDonalds → Food
- Gojek → Transport
- Steam → Entertainment

This reduces:

- token usage
- latency
- cloud cost

---

# Firestore Rules

Firestore usage must be optimized.

Use:

- lightweight schema
- indexed queries
- pagination
- batched writes
- optimistic updates
- local caching

Avoid:

- realtime listeners everywhere
- fetching full collections
- deeply nested collections
- duplicated writes

---

# Frontend Rules

Frontend should be:

- mobile-first
- lightweight
- responsive
- performant
- low-friction

Use:

- server components where possible
- dynamic imports
- route-based code splitting
- optimized images
- lazy loading

Avoid:

- oversized bundles
- unnecessary rerenders
- heavy chart libraries
- excessive animations

---

# UI Development Rules

Always follow DESIGN_SYSTEM.md.

Prioritize:

- spacing
- hierarchy
- readability
- mobile UX
- consistency

Avoid:

- overcrowded layout
- too many accent colors
- excessive glow
- inconsistent spacing
- dashboard visual noise

---

# Responsive Rules

## Mobile

Main priority.

Mobile should feel like:

- app-like experience
- immersive
- touch-friendly

Use:

- bottom navbar
- floating action button
- stacked sections

---

## Desktop

Desktop should:

- maintain breathing room
- avoid stretched content
- keep modular layout

Use:

- max width containers
- section hierarchy
- balanced whitespace

---

# Landing Page Rules

Landing page priorities:

1. clear value proposition
2. app preview
3. AI advantage
4. simple explanation
5. strong CTA

Avoid:

- complicated hero sections
- analytics-heavy visuals
- excessive feature spam

---

# Animation Rules

Animations should:

- improve UX
- feel smooth
- feel subtle

Avoid:

- animation spam
- aggressive motion
- flashy transitions

Performance is more important than aesthetics.

---

# Cloud Rules

Target:

- under $5 budget
- optimized cloud usage
- minimal server load

Use:

- cached responses
- lightweight functions
- shared utilities
- efficient queries

Avoid:

- heavy background jobs
- unnecessary polling
- long-running processes

---

# Security Rules

Always:

- validate user input
- secure Firebase rules
- sanitize uploaded data
- restrict API usage
- protect AI endpoints

Never:

- expose API keys
- trust client-side validation only

---

# Development Philosophy

Prefer:

- simple solutions
- maintainable code
- reusable components
- predictable architecture
- iterative development

Avoid:

- feature bloat
- unnecessary complexity
- overdesigned systems

---

# Final Engineering Direction

Build Ninja like:

- modern indie SaaS
- mobile-first AI product
- lightweight finance companion
- scalable but simple architecture

Prioritize:

1. UX clarity
2. performance
3. simplicity
4. maintainability
5. cloud efficiency
