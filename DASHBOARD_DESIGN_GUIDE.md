# Dashboard Visual Design Guide

## Overview Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  📊 Complaint Management Dashboard                                         │
│     Real-time overview of complaint status and priorities                  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┬──────────────────┬──────────────────┬──────────────┐ │
│  │   Total Compl.   │   Open Compl.    │  Resolved Compl. │ Closed Compl.│ │
│  │      │                                                                 │ │
│  │      45          │      15          │       20         │      10      │ │
│  │      │           │      33% pending │                  │              │ │
│  └──────────────────┴──────────────────┴──────────────────┴──────────────┘ │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────────────────┬────────────────────────────────────┐│
│  │                                    │                                    ││
│  │  Complaint Status Distribution     │  Complaint Priority Distribution  ││
│  │  (Pie Chart)                       │  (Pie Chart)                      ││
│  │                                    │                                    ││
│  │  • Open        ███  5              │  • Low      ███  5                ││
│  │  • Assigned    ███  3              │  • Medium   ███  25               ││
│  │  • In Progress ███  4              │  • Urgent   ███  12               ││
│  │  • Resolved    ███  7              │  • Very Urgent █ 3                ││
│  │  • Closed      ███  4              │                                    ││
│  │  • Rejected    █    1              │                                    ││
│  │                                    │                                    ││
│  └────────────────────────────────────┴────────────────────────────────────┘│
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────────────────┬────────────────────────────────────┐│
│  │                                    │                                    ││
│  │     Status Breakdown               │     Priority Breakdown            ││
│  │                                    │                                    ││
│  │  🟦 Open          15               │  🟩 Low           5               ││
│  │  🟪 Assigned       8               │  🟨 Medium       25               ││
│  │  🟧 In Progress   12               │  🟧 Urgent       12               ││
│  │  🟩 Resolved      20               │  🟥 Very Urgent   3               ││
│  │  🟫 Closed        10               │                                    ││
│  │  🟥 Rejected       2               │                                    ││
│  │                                    │                                    ││
│  └────────────────────────────────────┴────────────────────────────────────┘│
│                                                                             │
│                         [ Refresh Data ]                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Header Section
```
┌─────────────────────────────────────┐
│ 📊 Complaint Management Dashboard   │
│    Real-time overview of complaint  │
│    status and priorities            │
└─────────────────────────────────────┘
```

**Styling:**
- Font: 2.5rem, Bold (700), Dark Gray (#2c3e50)
- Subtitle: 1.1rem, Regular (400), Light Gray (#7f8c8d)
- Background: Gradient (Light Blue to Light Gray)

---

### 2. Metric Cards
```
┌────────────────────────────────────────────────────────────┐
│ TOP BORDER COLOR (Gradient)                               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  TOTAL COMPLAINTS                                         │
│  45                                                       │
│  All time complaints                                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Each Card Features:**
- 4px colored top border (different gradient per card)
- White background with subtle shadow
- Hover animation: Slight lift (translateY -5px)
- Responsive: 4 columns desktop, 2 tablets, 1 mobile

**Card Types:**
1. **Total** - Purple gradient
2. **Open** - Blue gradient (with pending percentage)
3. **Resolved** - Green gradient
4. **Closed** - Gray gradient

---

### 3. Pie Charts
```
┌────────────────────────────────────┐
│   Status Distribution              │
│                                    │
│          /────\                    │
│        /  Open  \                  │
│       │ (20%)   │                  │
│       │ Assigned│ In Progress      │
│        \  (15%) /                  │
│          \────/                    │
│                                    │
│  ✓ Open       15                  │
│  ✓ Assigned    8                  │
│  ✓ In Progress 12                 │
│  ✓ Resolved   20                  │
│  ✓ Closed     10                  │
│  ✓ Rejected    2                  │
│                                    │
└────────────────────────────────────┘
```

**Features:**
- Donut chart (65% hole size)
- Percentage labels on slices
- Color-coded by status/priority
- Legend at bottom
- Interactive tooltips on hover

---

### 4. Breakdown Tables
```
┌─────────────────────────────────────┐
│   Status Breakdown                  │
├─────────────────────────────────────┤
│ 🔷 Open            15              │
│ 🔷 Assigned         8              │
│ 🔷 In Progress     12              │
│ 🔷 Resolved        20              │
│ 🔷 Closed          10              │
│ 🔷 Rejected         2              │
└─────────────────────────────────────┘
```

**Table Features:**
- Color-coded icons (3x3px squares with status color)
- Clean row separators
- Hover highlight effect
- Count displayed on right
- 2 columns on desktop, stacked on mobile

---

## Color Palette

### Primary Colors
- **Primary Purple**: #667eea
- **Dark Purple**: #764ba2
- **Light Gray**: #f5f7fa
- **Dark Gray**: #2c3e50
- **Medium Gray**: #7f8c8d

### Status Colors
```
Open:         🟦 #2196F3 (Blue)
Assigned:     🟪 #9C27B0 (Purple)
In Progress:  🟧 #FF9800 (Orange)
Resolved:     🟩 #4CAF50 (Green)
Closed:       🟫 #607D8B (Gray)
Rejected:     🟥 #F44336 (Red)
```

### Priority Colors
```
Low:          🟩 #4CAF50 (Green)
Medium:       🟨 #FFC107 (Amber)
Urgent:       🟧 #FF9800 (Orange)
Very Urgent:  🟥 #F44336 (Red)
```

---

## Responsive Behavior

### Desktop (≥992px)
- 4-column metric cards in single row
- 2-column chart layout
- Full width tables side-by-side
- Regular font sizes

### Tablet (≥768px, <992px)
- 4-column metric cards with wrapping
- 2-column chart layout (may wrap)
- Tables side-by-side
- Slightly reduced padding

### Mobile (<768px)
- 1-column metric cards (stacked)
- 1-column chart layout (stacked)
- 1-column tables (stacked)
- Reduced font sizes and spacing
- Touch-optimized buttons

---

## Animation Effects

### Card Hover
```
Default State:  transform: none;
Hover State:    transform: translateY(-5px);
                box-shadow: 0 4px 16px rgba(0,0,0,0.15);
Duration:       300ms ease
```

### Chart Transitions
```
Duration:       300-500ms
Easing:         ease-out
Effect:         Smooth slice transitions on load
```

### Page Load Animation
```
Fade In:        opacity: 0 → 1
Slide Up:       translateY: 20px → 0
Duration:       500ms ease-out
Stagger:        Each section delayed by 100ms
```

---

## Typography

### Headers
- **Page Title**: 2.5rem, Bold (700), Dark Gray
- **Subtitle**: 1.1rem, Regular (400), Light Gray
- **Card Labels**: 0.85rem, Semi-Bold (600), Light Gray (uppercase)

### Content
- **Metric Values**: 2.5rem, Bold (700), Dark Gray
- **Descriptions**: 0.9rem, Medium (500), Light Gray
- **Table Text**: 0.95rem, Regular-Medium, Dark Gray
- **Small Text**: 0.8-0.85rem, Regular, Light Gray

---

## Spacing & Layout

### Container
- Max-width: 100% (fluid)
- Padding: 2rem (desktop), 1rem (mobile)
- Gap between sections: 2rem

### Cards
- Padding: 1.5rem (desktop), 1rem (mobile)
- Border-radius: 12px
- Gap between cards: 1.5rem (desktop)

### Charts
- Height: 400px
- Padding: 2rem 1.5rem
- Margin-bottom: 2rem

---

## Interactive Elements

### Buttons
```
Normal:  Background gradient (purple), white text
Hover:   Gradient reversed, slight lift animation
Active:  Slightly darker gradient
Disabled: 60% opacity, not-allowed cursor
```

### Tooltips
- Background: Light theme
- Font: 12px
- Positioned: Auto (above/below as needed)

### Loading State
- Spinner: Centered, 500px height
- Text: "Loading..."

### Error State
- Alert box with icon
- Dismissible with close button
- Red gradient background

---

## Accessibility Features

- ✅ Proper heading hierarchy (H1, H6)
- ✅ Color contrast ratios meet WCAG AA standards
- ✅ Semantic HTML structure
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigable buttons
- ✅ Clear error messages
- ✅ Loading indicators

---

## Performance Optimizations

- ✅ CSS animations use GPU (transforms, opacity)
- ✅ Efficient chart rendering with ApexCharts
- ✅ Single API call on mount
- ✅ Minimal re-renders with React hooks
- ✅ Lazy loading of components

---

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Example States

### Loading State
```
┌─────────────────────────────┐
│                             │
│           ⟳                 │
│       Loading...            │
│                             │
└─────────────────────────────┘
```

### Error State
```
┌─────────────────────────────┐
│ ⚠️ Error                    │
├─────────────────────────────┤
│ Failed to load dashboard    │
│ statistics. Please try      │
│ again later.                │
│                    [ × ]    │
└─────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────┐
│  ℹ️ No data available       │
│                             │
│  Create complaints to see   │
│  them on the dashboard.     │
└─────────────────────────────┘
```

---

This design provides a professional, clean, and user-friendly interface that displays complaint statistics effectively while maintaining excellent responsiveness across all devices.
