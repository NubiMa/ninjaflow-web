# 🥷 Ninja Finance App — Project Status & Roadmap

This document outlines the current progress of the application based on the requirements defined in `AGENTS.md` and `PRODUCT.md`.

---

## ✅ Features Done & Fixed (Completed)

### 1. Authentication & Security
- [x] **Email & Password Auth:** Full registration and login flow.
- [x] **Strict Google Sign-In:** Logic separated between Sign-Up and Login. Prevented unregistered users from accidentally bypassing the login screen.
- [x] **UI Polish:** Added "Kembali ke Beranda" buttons to auth pages for seamless navigation.

### 2. UI/UX & Architecture
- [x] **Premium Design System:** Implemented "Ocean Blue" dark mode, glassmorphism, and subtle Framer Motion animations.
- [x] **Responsive Layouts:** Mobile-first stacked UI with bottom navigation, scaling perfectly to wide desktop grids (resolving squished/overflowing elements).
- [x] **Landing Page:** High-converting, aesthetic introduction to the product value.

### 3. Core Tracking & Database
- [x] **Transaction Management:** Add Income/Expense items.
- [x] **Optimized Firestore Queries:** Implemented client-side memory sorting, completely bypassing the tedious manual setup of Firebase Composite Indexes for the end-user.
- [x] **Financial Goals:** Goals page structure allowing users to set target savings.

### 4. AI Insight Engine
- [x] **Gemini Integration:** Secured server-side actions using `@google/genai` (Gemini 2.5 Flash).
- [x] **Structured AI Output:** Prompt engineering to return clean JSON formats containing a supportive reflection and 3 actionable summary cards.
- [x] **Token & Cost Optimization:** Engineered a `localStorage` cache system that checks transaction counts and 5-minute cooldowns.
- [x] **Spam Protection:** Built an elegant UI toast popup that blocks manual generation if there are no new transactions.

### 5. AI Receipt Scanner (OCR) — IN IMPLEMENTATION PLAN
- [ ] See implementation plan below.

---

## ⏳ Features Not Yet Added (Pending)

### 1. Transaction Enhancements
- [x] **Edit & Delete:** Full CRUD capabilities for existing transactions.
- [x] **Advanced Filtering:** Sorting history by custom date ranges or categories.
- [x] **Rule-Based Categorization:** Hardcoded fallback rules (e.g., "Starbucks" -> "Makanan") to save AI tokens.

### 2. Profile & Settings
- [ ] **Editable Profile:** Allowing users to change their display name, avatar, and base currency.
- [ ] **Monthly Budget:** Setting a hard cap on monthly spending limits.

---

## 💡 Recommended Features (AI Suggestions)

1. **PWA (Progressive Web App) Setup**
2. **Budget Threshold Alerts**
3. **Data Export (CSV)**
4. **Offline Read-Only Mode**
5. **Goal Celebration Animations**

---

---

# 📸 OCR Receipt Scanner — Implementation Plan

> Status: **Awaiting Approval** | Architecture: Separated Vision AI Pipeline

---

## Overview

Add a receipt/document scanning feature with 2 modes — **Photo Upload** and **Live Camera**. Uses a dedicated Gemini API key isolated from the Insight AI to prevent 429 quota sharing.

---

## Step 1: Environment Setup

**File:** `.env`

Add a new, separate environment variable for Vision AI:
```
VISION_AI_API_KEY=YOUR_SECOND_GEMINI_KEY_HERE
```

---

## Step 2: Separated Vision AI Handler

**New File:** `src/app/actions/vision.ts`

- Uses `VISION_AI_API_KEY` (completely isolated from `GEMINI_API_KEY`)
- Accepts a base64-encoded image string
- Sends a multimodal prompt to `gemini-2.5-flash`
- Returns a structured `TransactionDraft` JSON object with:
  - `merchant`: store/restaurant name
  - `amount`: total amount in IDR
  - `date`: parsed date from receipt
  - `category`: rule-based first, AI fallback second
  - `note`: auto-generated description
- **Never** saves directly — always returns a draft for user review

---

## Step 3: Image Compression Utility

**New File:** `src/lib/compress-image.ts`

- Uses browser `Canvas API` (no external lib needed)
- Compresses uploaded/captured image to max `800x800px`, quality `0.7`
- Converts to base64 string for AI submission
- Reduces token cost and upload time

---

## Step 4: 3-Option Add Transaction UI

**Modified File:** `src/app/(app)/dashboard/transactions/page.tsx`

Replace the single `+ Tambah` button with a **bottom sheet selection menu** with 3 options:

| Icon | Label | Action |
|------|-------|--------|
| ✏️ | Manual | Opens existing `AddSheet` form |
| 🖼️ | Foto / Dokumen | Opens file picker (image/*) |
| 📷 | Kamera Realtime | Opens `CameraSheet` component |

---

## Step 5: Photo/Document Upload Flow

**Inside Modified `AddSheet`:**

1. User picks an image file from gallery/device.
2. Image compressed using `compress-image.ts`.
3. Compressed base64 sent to `vision.ts` Server Action.
4. AI returns `TransactionDraft` JSON.
5. Draft pre-populates the `AddSheet` form fields (amount, merchant, note, category).
6. User reviews and edits if needed.
7. User confirms → saves to Firestore.

**Loading state:** A skeleton shimmer replaces the form while AI is processing.

---

## Step 6: Live Camera Scan Flow

**New Component:** `src/components/CameraSheet.tsx`

Architecture:
1. Renders a full-screen bottom sheet with a `<video>` element (live camera feed).
2. Draws a **frosted scanning frame** overlay box in the center of the camera view.
3. A `📸 Scan` button captures the current video frame to a `<canvas>`.
4. Canvas image compressed and sent to `vision.ts`.
5. Same review draft flow as Photo Upload.
6. Camera stream properly stopped when sheet closes (prevents memory leaks).

---

## Step 7: Draft Review UI

**New Shared Component:** `src/components/ScanResultSheet.tsx`

Displays the AI-extracted data in an editable form before saving:
- Pre-filled `amount`, `merchant`, `note`, `category`, `date`
- All fields remain fully editable
- Two buttons: **Simpan Transaksi** (save) and **Perbaiki Manual** (goes back to manual form)
- A small banner: *"Diperiksa oleh AI Ninja — pastikan data sudah benar sebelum menyimpan."*

---

## File Map Summary

| File | Action |
|------|--------|
| `.env` | Add `VISION_AI_API_KEY` |
| `src/app/actions/vision.ts` | **NEW** — Vision AI Server Action |
| `src/lib/compress-image.ts` | **NEW** — Client-side image compression |
| `src/components/CameraSheet.tsx` | **NEW** — Live camera UI |
| `src/components/ScanResultSheet.tsx` | **NEW** — Draft review & confirm UI |
| `src/app/(app)/dashboard/transactions/page.tsx` | **MODIFIED** — 3-option add button |

---

## Cost & Architecture Notes

- `VISION_AI_API_KEY` is isolated → Insight AI quota is never shared with Vision AI.
- Images compressed to `~200-400KB` before sending → reduces token costs per image.
- Vision AI is only triggered on user explicit action (button press) → never runs in background.
- Rule-based categorization (`categorizeByMerchant`) is attempted **first** before AI inference.
