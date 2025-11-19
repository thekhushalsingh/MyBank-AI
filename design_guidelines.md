# MyBankAI Design Guidelines

## Design Approach
**Design System**: Carbon Design System inspired approach - optimized for data-heavy enterprise applications with emphasis on trust, security, and clarity. Banking interfaces demand professional restraint, clear information hierarchy, and unwavering consistency.

## Core Design Principles
1. **Trust Through Transparency**: Every UI element reinforces security and clarity
2. **Information Hierarchy**: Critical data (decisions, audit logs) receives primary visual weight
3. **Functional Clarity**: Zero ambiguity in controls, states, and actions
4. **Dual-Portal Consistency**: Shared design language with role-appropriate complexity

---

## Typography System

**Font Stack**: IBM Plex Sans (primary), Inter (fallback), system-ui
- **Headlines (H1)**: text-4xl, font-semibold, tracking-tight
- **Section Headers (H2)**: text-2xl, font-semibold
- **Subsections (H3)**: text-xl, font-medium
- **Body Text**: text-base, font-normal, leading-relaxed
- **Metadata/Timestamps**: text-sm, font-normal, opacity-75
- **Labels**: text-sm, font-medium, uppercase, tracking-wide
- **Monospace Data**: Font Mono for hashes, IDs, technical data

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-6 (cards), p-8 (sections)
- Vertical rhythm: space-y-6 (standard), space-y-8 (sections)
- Form spacing: space-y-4
- Grid gaps: gap-4 (dense), gap-6 (standard), gap-8 (spacious)

**Container Strategy**:
- Page containers: max-w-7xl mx-auto px-6
- Content cards: max-w-4xl for forms/feeds
- Dashboard widgets: Full-width grid layouts
- Admin tables: w-full with horizontal scroll on mobile

---

## Component Library

### Navigation
**Customer Portal**: Top navigation bar with logo left, profile/logout right, subtle bottom border
**Admin Dashboard**: Sidebar navigation (fixed left, w-64) with main content area, collapsible on mobile

### Cards & Containers
- **Decision Cards**: Rounded-lg, border, shadow-sm, p-6, hover:shadow-md transition
- **Profile Inference Items**: flex layout, icon left, text center, action button right
- **Audit Log Entries**: Table rows with alternating subtle backgrounds, monospace for technical data

### Forms & Controls
**Consent Toggles**:
- Large switch components with clear ON/OFF states
- Label left, toggle right, helper text below
- Locked toggle: disabled state with lock icon and tooltip

**Correction Request Button**:
- Secondary button style (border, no fill)
- Icon + text ("Request Correction")
- Opens modal form overlay

### Data Display
**Decision Feed**:
- Timeline/list layout with left border accent
- Card per decision: title (bold), timestamp (small), [Why?] link (interactive)
- Expandable explanation panel below (slide-down animation)

**Audit Log Table**:
- Sticky header row
- Columns: Timestamp | User ID | Decision Type | Model Version | Status | Actions
- Monospace for IDs/hashes
- Action buttons: icon-only, tooltip on hover

**Fairness Monitor**:
- Chart.js bar/line charts in card containers
- Alert banners above charts (warning state with icon)
- Legend below chart, responsive to mobile

### Buttons & Actions
**Primary**: Solid background, rounded-md, px-6 py-3, font-medium
**Secondary**: Border, transparent fill, same padding
**Danger**: For reject/critical actions
**Icon Buttons**: Square, p-2, border radius full

### Status Indicators
- **Approved**: Green dot + text
- **Pending**: Yellow dot + text  
- **Rejected**: Red dot + text
- **Appealed**: Blue dot + text
Badge style: inline-flex, rounded-full, px-3 py-1, text-xs, font-medium

### Modals & Overlays
- Centered overlay with backdrop blur
- max-w-md to max-w-2xl depending on content
- Header with title and close X
- Footer with Cancel/Confirm buttons (right-aligned)

---

## Page Layouts

### Customer Portal

**AI Profile Page**:
- Hero section: "Your AI Profile" heading + description paragraph
- 2-3 inference cards in vertical stack (not grid)
- Each card: inference label, confidence level, correction button right

**Data & Consent Page**:
- Section header with explanation
- 3 toggle rows, each with label, description, and toggle
- Fraud detection toggle disabled with lock icon + tooltip

**Recent Decisions Feed**:
- Header with filter/search (future feature placeholder)
- List of decision cards, most recent first
- "Why?" expands inline explanation with technical + plain language

### Admin Dashboard

**Audit Log**:
- Page title + date range filter (top)
- Full-width data table
- Pagination footer

**Correction Queue**:
- Tabs: Pending | Approved | Rejected
- Card-based layout for each request
- Approve/Reject buttons in card footer
- Inline notes field for admin comments

**Fairness Monitor**:
- Grid of chart cards (grid-cols-1 md:grid-cols-2)
- Alert banner if thresholds crossed (sticky top)
- Metric cards above charts (grid-cols-3)

---

## Images

**No hero images** - this is a data-focused enterprise application. All visual weight should go to information clarity, not decorative imagery.

**Icons only**: Use Carbon Icons or Heroicons for:
- Navigation items
- Status indicators  
- Action buttons
- Inline warnings/alerts

---

## Animations

**Minimal and Purposeful**:
- Toggle switches: 150ms ease transition
- Card hover elevation: 200ms ease
- Expandable explanations: 300ms slide-down
- Modal fade-in: 200ms
- No decorative animations

---

## Accessibility
- All toggles keyboard navigable
- Focus rings on interactive elements (ring-2 ring-offset-2)
- ARIA labels for icon-only buttons
- Table headers properly associated
- Color not sole indicator (use icons + text)
- Minimum contrast ratio 4.5:1 for all text