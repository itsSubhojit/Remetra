---
name: Remetra
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353942'
  surface-container-lowest: '#0a0e16'
  surface-container-low: '#181c24'
  surface-container: '#1c2028'
  surface-container-high: '#262a33'
  surface-container-highest: '#31353e'
  on-surface: '#dfe2ee'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dfe2ee'
  inverse-on-surface: '#2c3039'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00885d'
  on-tertiary-container: '#000703'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0f131c'
  on-background: '#dfe2ee'
  surface-variant: '#31353e'
typography:
  display:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Outfit
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Outfit
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
  numeric-metric:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies precise financial stewardship, cognitive ease, and executive-tier clarity. Built for modern financial visibility, the system reduces anxiety surrounding recurring commitments, cash flow forecasting, and deadline tracking.

The design movement blends **Modern Dark-Mode Minimalism** with **Refined Glassmorphism**. Dark surfaces alleviate visual strain during deep administrative work, while translucent overlays, subtle gradient borders, and calculated spatial gaps elevate the interface from a utilitarian ledger to a high-end command center. 

Key attributes:
- **Trustworthy & Disciplined:** Financial states are uncompromised; data density is high yet meticulously spaced.
- **Calm & Proactive:** Avoids alarming alerts through structured color accents, prioritizing anticipation over crisis.
- **Architectural Polish:** Uses faint rim lighting, low-contrast slate dividers, and luminous jewel-tone status indicators.

## Colors

The palette operates on an ultra-deep obsidian foundation (`#0B0F17`), layering elevated surfaces to produce a natural hierarchy without blinding contrast.

### Core Roles
- **Canvas Base (`#0B0F17`):** The primary void. All navigation sidebars and macro dashboards draw root depth from this value.
- **Card Surface (`#151D2A`):** The functional container tier, offering an 8% lift over the background for crisp separation without harshness.
- **Primary Indigo (`#6366F1`):** Primary interactions, focused active tabs, and forward-looking action triggers.
- **Secondary Sky (`#38BDF8`):** Informational callouts, upcoming milestones, and cyclical projections.
- **Border Trim (`#1E293B`):** Structural delineation across cards, tables, and modal structures.

### Financial Lifecycle States
- **Paid / Cleared (`#10B981`):** Emerald green, representing fulfilled liabilities and net-positive trends.
- **Due Soon (`#F59E0B`):** Warm amber, prompting action within a 72-hour window.
- **Overdue / Critical (`#EF4444`):** Pure crimson, reserved exclusively for elapsed deadlines, failed webhooks, or account shortfalls.

### Neutral Stack
- **Text Primary (`#F8FAFC`):** Headline metrics and account balances.
- **Text Secondary (`#94A3B8`):** Metadata, recurrence frequencies, and table headers.
- **Text Muted (`#475569`):** Disabled states, past timestamps, and structural glyphs.

## Typography

The typographic hierarchy pairs **Outfit** for prominent figures, section titling, and dashboard metrics with **Inter** for dense transactional tables, forms, and analytical metadata.

- **Display & Metrics:** Outfit lends geometric clarity and modern restraint. Metric displays feature tighter letter-spacing (`-0.02em`) to bind currency symbols to integer values.
- **Body & Tabular Reading:** Inter delivers neutral, high-legibility execution across deep data matrices. Numeric tables must enable `font-variant-numeric: tabular-nums` to ensure vertical alignment of recurring balances.
- **Labels & Micro-copy:** Uppercase applications are reserved exclusively for `label-sm` (e.g., category badges, billing cycles) paired with wide letter-spacing (`0.05em`) to retain legibility against dark slate card surfaces.

## Layout & Spacing

The system enforces a 12-column responsive fluid grid anchored by an 8pt base grid for component-level rhythm.

### Grid & Breakpoints
- **Desktop (≥1280px):** 12 columns, `margin: 2rem`, `gutter: 1.5rem`. Max layout width caps at `1440px` with persistent left vertical navigation (260px).
- **Tablet (768px - 1279px):** 8 columns, `margin: 1.5rem`, `gutter: 1rem`. Sidebar collapses to an icon rail (72px).
- **Mobile (<768px):** 4 columns, `margin: 1rem`, `gutter: 1rem`. Sidebar transforms into a bottom-docked navigation bar.

### Spacing Principles
- **Macro Distribution:** Cards, charts, and table sections are separated using `space-xl`.
- **Card-Level Padding:** Dashboard metric blocks maintain an internal inset of `space-lg` (24px).
- **Micro Grouping:** Icon-to-text intervals and input interior gaps are restricted to `space-xs` and `space-sm`.

## Elevation & Depth

Visual depth is achieved through translucent planar layering, faint hairline borders, and tinted luminescent glows rather than standard black dropshadows.

### Layer Architecture
1. **Level 0 (Canvas):** `#0B0F17` pure solid background.
2. **Level 1 (Structural Cards):** `#151D2A` with a 1px solid border of `#1E293B`.
3. **Level 2 (Glass Overlays / Hover States):** Background set to `rgba(21, 29, 42, 0.75)` with `backdrop-filter: blur(12px)` and border `rgba(255, 255, 255, 0.08)`.
4. **Level 3 (Modals & Floating Panels):** Background `#151D2A` elevated with a directional shadow: `0 20px 40px -15px rgba(0, 0, 0, 0.65)`, complemented by a subtle indigo rim highlight (`0 0 0 1px rgba(99, 102, 241, 0.2)`).

### Luminous Status Flares
Crucial visual alerts utilize faint atmospheric glows rather than harsh outlines:
- **Overdue Attention:** A radial glow behind overdue metric cards: `box-shadow: 0 0 24px -6px rgba(239, 68, 68, 0.25)`.
- **Upcoming Milestone:** Faint sky bloom: `box-shadow: 0 0 20px -6px rgba(56, 189, 248, 0.2)`.

## Shapes

The design system implements a refined **Rounded (Level 2)** standard to preserve technical precision while avoiding rigid corporatism.

- **Base Radius (0.5rem / 8px):** Applied to form inputs, search fields, inner list rows, action buttons, and segmented controls.
- **Large Radius (1rem / 16px):** Applied to standard dashboard cards, financial breakdown modules, and recurring bill summary panels.
- **Extra Large Radius (1.5rem / 24px):** Applied exclusively to floating sheets, modal dialogs, and parent container frames.
- **Pill Radius (9999px):** Applied strictly to status tags (Paid, Due, Overdue), inline filter pills, and quick-action avatar chips.

## Components

### Buttons
- **Primary:** Background `#6366F1`, label `#FFFFFF` (`label-lg`), border none. On hover, background shifts to `#4F46E5` with `box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35)`. Active scale: `0.98`.
- **Secondary / Ghost:** Background `rgba(30, 41, 59, 0.4)`, border `1px solid #1E293B`, text `#F8FAFC`. On hover, border transitions to `rgba(99, 102, 241, 0.4)` with surface fill `rgba(30, 41, 59, 0.8)`.
- **Destructive:** Background `rgba(239, 68, 68, 0.1)`, border `1px solid rgba(239, 68, 68, 0.2)`, text `#EF4444`. Hover intensifies fill to `rgba(239, 68, 68, 0.2)`.

### Financial Status Chips & Badges
- Fully rounded pill shape with `padding: 4px 10px`, font `label-sm`.
- **Paid:** Background `rgba(16, 185, 129, 0.12)`, text `#10B981`, border `1px solid rgba(16, 185, 129, 0.25)`.
- **Due Soon:** Background `rgba(245, 158, 11, 0.12)`, text `#F59E0B`, border `1px solid rgba(245, 158, 11, 0.25)`.
- **Overdue:** Background `rgba(239, 68, 68, 0.12)`, text `#EF4444`, border `1px solid rgba(239, 68, 68, 0.25)`.
- **Upcoming:** Background `rgba(56, 189, 248, 0.12)`, text `#38BDF8`, border `1px solid rgba(56, 189, 248, 0.25)`.

### Cards & Metric Modules
- Background `#151D2A`, border `1px solid #1E293B`, radius `1rem`, padding `1.5rem`.
- **Interactive Variant:** On cursor hover, border transitions to `rgba(99, 102, 241, 0.3)`, card lifts `-2px`, and an ultra-soft glass gradient highlights the top border edge (`linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)`).

### Input Fields & Selects
- Height 40px, background `#0B0F17`, border `1px solid #1E293B`, radius `0.5rem`, typography `body-md` in `#F8FAFC`.
- Focus state: border turns `#6366F1` with an outer focus-ring `box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2)`.
- Placeholder text utilizes `#475569`. Leading currency or calendar icons render in `#94A3B8`.

### Lists & Transaction Tables
- Table header: `label-sm` uppercase, color `#94A3B8`, bottom border `1px solid #1E293B`, height 44px.
- Rows: Clean alternating rows avoided; instead use transparent backings with `1px solid rgba(30, 41, 59, 0.5)` dividers. On hover, row background lights up to `rgba(30, 41, 59, 0.3)`.
- Figures right-align, utilizing monospace tabular numerals.

### Checkboxes & Selection Controls
- Checkbox: 18x18px, border `1px solid #1E293B`, radius `4px`, background `#0B0F17`.
- Checked state: Background `#6366F1`, border `#6366F1`, checked glyph in `#FFFFFF`.

### Specialized Domain Components
- **Spend Velocity Sparklines:** Subtle single-stroke SVG curves in `#38BDF8` or `#10B981` with semi-transparent vertical area fills (`stop-opacity: 0.15` down to `0`).
- **Upcoming Cycle Progress Bar:** Track background `#1E293B`, filled indicator in gradient `#6366F1` to `#38BDF8`, height 6px, rounded full.