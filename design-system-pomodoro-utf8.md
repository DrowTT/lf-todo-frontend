## Design System: LF Todo Pomodoro

### Pattern
- **Name:** Minimal Single Column
- **Conversion Focus:** Single CTA focus. Large typography. Lots of whitespace. No nav clutter. Mobile-first.
- **CTA Placement:** Center, large CTA button
- **Color Strategy:** Minimalist: Brand + white #FFFFFF + accent. Buttons: High contrast 7:1+. Text: Black/Dark grey
- **Sections:** 1. Hero headline, 2. Short description, 3. Benefit bullets (3 max), 4. CTA, 5. Footer

### Style
- **Name:** Micro-interactions
- **Keywords:** Small animations, gesture-based, tactile feedback, subtle animations, contextual interactions, responsive
- **Best For:** Mobile apps, touchscreen UIs, productivity tools, user-friendly, consumer apps, interactive components
- **Performance:** 鈿?Excellent | **Accessibility:** 鉁?Good

### Colors
| Role | Hex |
|------|-----|
| Primary | #0D9488 |
| Secondary | #14B8A6 |
| CTA | #F97316 |
| Background | #F0FDFA |
| Text | #134E4A |

*Notes: Teal focus + action orange*

### Typography
- **Heading:** Inter
- **Body:** Inter
- **Mood:** minimal, clean, swiss, functional, neutral, professional
- **Best For:** Dashboards, admin panels, documentation, enterprise apps, design systems
- **Google Fonts:** https://fonts.google.com/share?selection.family=Inter:wght@300;400;500;600;700
- **CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

### Key Effects
Small hover (50-100ms), loading spinners, success/error state anim, gesture-triggered (swipe/pinch), haptic

### Avoid (Anti-patterns)
- Complex onboarding
- Slow performance

### Pre-Delivery Checklist
- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px

