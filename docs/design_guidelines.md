# ActiveYear — Design Guidelines

## Design Philosophy

**Core Principle:** *Achievement, not information.*

ActiveYear celebrates athletic accomplishment. Every design decision should make users feel proud of their year. We're building trophies, not dashboards.

**Guiding Questions:**
- Does this make the user feel like an athlete?
- Would someone screenshot this unprompted?
- Does it feel earned, not generated?

---

## Visual Identity

### Tone

**Bold. Celebratory. Earned.**

- Confident typography that commands attention
- High contrast for maximum shareability
- Data as achievement, not spreadsheet
- Visceral impact over information density

### Color Principles

Use CSS variables for all colors. Define in `:root` with theme-specific overrides.

```css
:root {
  --color-surface: #0a0a0b;
  --color-text-primary: #fafafa;
  --color-text-muted: #71717a;
  --color-accent: #22d3ee;
  --color-accent-glow: rgba(34, 211, 238, 0.4);
}
```

**Rules:**
- One dominant accent per theme. Never split attention.
- Text contrast minimum: 7:1 for stats, 4.5:1 for labels
- Glow/gradient effects use accent color at 20-40% opacity
- Dark themes: pure black (#000) feels dead. Use near-black (#0a0a0b)

### Typography

**Display Font:** Use a distinctive, characterful typeface for headlines and stats. Avoid generic sans-serifs (Inter, Roboto, Arial). Consider:
- Geometric: Clash Display, Satoshi, General Sans
- Technical: JetBrains Mono, Space Mono (for data)
- Expressive: Cabinet Grotesk, Switzer, Outfit

**Body Font:** Pair with a readable sans-serif that shares DNA with the display choice.

**Hierarchy:**
| Element | Size | Weight | Tracking |
|---------|------|--------|----------|
| Hero stat | 4rem+ | 700-900 | -0.02em |
| Section header | 1.5rem | 600 | 0 |
| Stat value | 2.5rem | 700 | -0.01em |
| Stat label | 0.875rem | 500 | 0.05em (uppercase) |
| Body text | 1rem | 400 | 0 |

**Rules:**
- Stats are the headline. Make them unmissable.
- Labels in uppercase with letter-spacing feel more "badge-like"
- Never use more than 2 typefaces per theme

---

## Theme Specifications

Each theme is a complete visual system. Users switch themes, not individual colors.

### Neon

**Aesthetic:** Cyberpunk trophy case. Night race energy.

- **Background:** Near-black (#0a0a0b) with subtle noise texture (2-3% opacity)
- **Accent:** Electric cyan (#22d3ee) or hot magenta (#f472b6)
- **Effects:** 
  - Glow on stats: `text-shadow: 0 0 30px var(--color-accent-glow)`
  - Gradient borders: `linear-gradient(135deg, accent 0%, transparent 60%)`
  - Scanline overlay (optional): repeating horizontal lines at 5% opacity
- **Typography:** Geometric sans or monospace for data

### Minimalist

**Aesthetic:** Swiss precision. The stat speaks.

- **Background:** Off-white (#fafaf9) or warm gray (#f5f5f4)
- **Accent:** Single bold color (signal red #ef4444 or deep black #0a0a0b)
- **Effects:** None. Whitespace is the effect.
- **Layout:** Rigid grid. Generous padding (2rem+). Asymmetric balance.
- **Typography:** Tight tracking on large numbers. Uppercase labels.

### Retro

**Aesthetic:** 8-bit achievement unlocked. Arcade high score.

- **Background:** Deep purple (#1e1b4b) or CRT black with slight blue cast
- **Accent:** Pixel-perfect primaries (yellow #facc15, green #4ade80)
- **Effects:**
  - Pixelated edges (use `image-rendering: pixelated` on decorative elements)
  - Chunky borders (4px solid)
  - CRT glow: subtle bloom on text
- **Typography:** Press Start 2P, VT323, or similar pixel font

---

## Component Patterns

### Stat Cards

The atomic unit of ActiveYear. Must be instantly readable and screenshot-worthy.

**Structure:**
```
┌─────────────────────┐
│     STAT VALUE      │  ← Largest, boldest
│     stat label      │  ← Smaller, muted
│  supporting detail  │  ← Optional context
└─────────────────────┘
```

**Rules:**
- Value always dominates. 3x-4x larger than label.
- Round aggressively for impact: "847 km" not "847.32 km"
- One idea per card. No compound stats.

### Personal Records

Badge-like treatment. These are achievements, not data points.

**Visual Cues:**
- Icon or trophy symbol
- Distinct background (slight elevation or border)
- Date/activity context as secondary info

### Progress Indicators

For upload/processing states:

- Determinate when possible ("Analyzing 127 of 347 activities...")
- Skeleton loading for metric cards (pulsing placeholder, not spinner)
- Success state with brief celebration (subtle scale + fade)

### Buttons

**Primary (Download/Export):**
- Full accent color background
- High contrast text
- Generous padding (1rem 2rem minimum)
- Hover: slight lift (translateY -2px) + shadow increase

**Secondary (Theme/Ratio toggles):**
- Ghost style or subtle background
- Border for definition
- Active state clearly distinguished

---

## Layout

### Responsive Strategy

**Mobile-first.** The card is the product; it must be perfect at 375px.

| Breakpoint | Behavior |
|------------|----------|
| < 640px | Single column. Stacked cards. Full-bleed export preview. |
| 640-1024px | 2-column grid for stats. Preview centered. |
| > 1024px | Sidebar controls + main preview area. |

### Export Canvas

The shareable image. This is what users actually care about.

**Layout Principles:**
- Visual hierarchy: Name/year → Hero stat → Supporting stats → Watermark
- Safe zones: 5% padding from edges for platform cropping
- Watermark: Bottom-right, subtle but legible. `activeyear.app` in muted text.

**Aspect Ratios:**
- 9:16 (1080×1920): Vertical stack, maximum stat size
- 1:1 (1080×1080): Compact grid, balanced composition
- 4:5 (1080×1350): Hybrid, slight vertical emphasis

---

## Motion

Use Svelte's built-in `svelte/motion` (spring, tweened).

### Entry Animations

Stats should feel revealed, not rendered.

```svelte
<script>
  import { spring } from 'svelte/motion';
  const value = spring(0, { stiffness: 0.1, damping: 0.4 });
  onMount(() => value.set(targetValue));
</script>
```

**Stagger Pattern:**
- Hero stat: 0ms delay
- Primary stats: 100ms delay each
- Secondary stats: 200ms delay each
- Total reveal under 800ms

### Micro-interactions

- **Theme switch:** Crossfade (150ms ease-out)
- **Button hover:** Scale 1.02 + shadow lift
- **Toggle active:** Spring with slight overshoot
- **Download complete:** Brief pulse + checkmark morph

### Performance Rules

- Prefer `transform` and `opacity` (GPU-accelerated)
- No animation on scroll-locked elements
- Respect `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

---

## Accessibility

### Requirements

- All interactive elements keyboard accessible
- Focus states visible and on-theme (use accent color ring)
- Color contrast meets WCAG AA minimum
- Alt text for decorative icons: `aria-hidden="true"`
- Screen reader announcements for state changes (upload complete, etc.)

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

---

## Imagery & Icons

### Icons

Use a consistent icon set. Recommendations:
- Lucide (clean, customizable stroke width)
- Phosphor (multiple weights)

**Rules:**
- Stroke width consistent across all icons (1.5-2px)
- Size proportional to adjacent text (1.25em default)
- Accent color for interactive, muted for decorative

### Decorative Elements

- Noise textures: PNG overlay at 2-5% opacity
- Gradients: Use `radial-gradient` for spotlight effects
- Grid/lines: Subtle, never compete with data

---

## Copy Guidelines

### Tone

Confident, concise, celebratory.

**Do:**
- "847 km" (clean, proud)
- "2.3 Everests climbed" (achievement framing)
- "Your data never leaves this browser" (direct reassurance)

**Don't:**
- "You ran a total of 847.32 kilometers this year!" (verbose, try-hard)
- "2.3x the elevation of Mount Everest" (explaining the joke)
- "We take your privacy seriously..." (corporate speak)

### Number Formatting

- Distances: No decimals under 100, one decimal over ("42 km", "847.3 km")
- Elevation: Round to nearest 10m
- Time: Hours and minutes ("127h 34m"), never seconds for totals
- Calories: Round to nearest 100 for totals
- Counts: Exact numbers ("94 runs", not "~90 runs")

---

## Implementation Checklist

### Before Building a Component

- [ ] Which theme(s) does this appear in?
- [ ] What's the mobile layout?
- [ ] Does it animate? What triggers it?
- [ ] Is there a loading/empty state?

### Before Shipping a Feature

- [ ] Works at all 3 export ratios
- [ ] Renders correctly in all 3 themes
- [ ] Keyboard accessible
- [ ] Motion respects reduced-motion preference
- [ ] Screenshot test: would you share this?

---

## Anti-Patterns

Avoid these common pitfalls:

| Anti-Pattern | Why It Fails | Do Instead |
|--------------|--------------|------------|
| Gradient soup | Feels AI-generated, no hierarchy | One accent, applied consistently |
| Stat overload | Dilutes impact, decision fatigue | Curate ruthlessly. 6-8 stats max per card. |
| Generic icons | Feels like a template | Custom or none. Icons should earn their place. |
| Centered everything | Passive, lifeless | Intentional alignment. Asymmetry creates energy. |
| Thin fonts for stats | Hard to read, feels weak | Bold weights for numbers. Stats are headlines. |
| Drop shadows everywhere | Dated, noisy | Reserve for intentional elevation. |

---

## Reference Palette

Quick-reference values for common needs:

### Spacing Scale (rem)
`0.25 | 0.5 | 0.75 | 1 | 1.5 | 2 | 3 | 4 | 6 | 8`

### Border Radius
- Cards: `0.75rem` (Neon/Minimalist), `0` (Retro)
- Buttons: `0.5rem`
- Pills/tags: `9999px`

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.15);
--shadow-glow: 0 0 30px var(--color-accent-glow);
```

### Transitions
```css
--transition-fast: 150ms ease-out;
--transition-base: 200ms ease-out;
--transition-slow: 300ms ease-out;
--transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
```
