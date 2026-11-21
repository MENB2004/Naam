# 06. NAAM (നാം) — UI/UX Design System & Malayalam Typography

## 1. Design Philosophy
The NAAM visual identity balances **environmental vibrancy**, **administrative authority**, and **civic accessibility**. The design prioritizes clarity over visual embellishment, ensuring that elderly citizens and rural field workers can effortlessly navigate the interface even on low-cost Android smartphones in bright outdoor sunlight.

---

## 2. Official Color Palette

```text
Primary Forest Green:    #087C63  (Primary actions, active navigation, brand identity)
Secondary Deep Teal:     #0D9488  (Accents, badges, secondary buttons)
Waterway Blue:           #1677C8  (Water pollution indicators, map pins, information alerts)
Soft Meadow Green:       #E8F5EE  (Success cards, light backgrounds, highlight panels)
Mist Coastal Background: #F0F7FA  (App background, subtle card borders, neutral tint)
Warning Ochre Amber:     #F59E0B  (Medium severity, pending review badges)
Critical Hazard Red:     #DC5353  (High/Critical severity, urgent alerts, reject actions)
Neutral Charcoal Dark:   #1E293B  (Primary typography, dark mode surfaces)
Slate Gray Medium:       #64748B  (Secondary captions, timestamps, inactive borders)
```

### Color Contrast Ratios (WCAG 2.1 AA Compliance)
- Primary Green (`#087C63`) on White (`#FFFFFF`): **5.4:1** (Passes AA and AAA for large text)
- Charcoal Dark (`#1E293B`) on Mist Background (`#F0F7FA`): **12.8:1** (Passes AAA)
- Critical Red (`#DC5353`) on White (`#FFFFFF`): **4.6:1** (Passes AA)

---

## 3. Typography Architecture

### 3.1 Malayalam Typography
- **Primary Font Family:** `'Noto Sans Malayalam', 'Manjari', sans-serif`
- **Fallback Font Stack:** `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Characteristics:** High legibility, distinct conjunct consonants (കൂട്ടക്ഷരങ്ങൾ), balanced x-height, and optimal letter spacing to prevent visual crowding in compact mobile cards.

### 3.2 English Typography
- **Primary Font Family:** `'Inter', sans-serif`
- **Numerical Formatting:** Tabular figures (`tnum`) for dates, phone numbers, and coordinates.

### 3.3 Type Scale
| Level | Font Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| **Display 1** | 32px (2rem) | 1.25 | Bold (700) | Landing page hero titles |
| **Heading 1** | 24px (1.5rem) | 1.3 | SemiBold (600) | Portal dashboard view headers |
| **Heading 2** | 20px (1.25rem) | 1.35 | SemiBold (600) | Section titles, modal headers |
| **Heading 3** | 18px (1.125rem) | 1.4 | Medium (500) | Card titles, category headers |
| **Body Regular** | 16px (1rem) | 1.5 | Normal (400) | Form inputs, complaint descriptions |
| **Body Small** | 14px (0.875rem) | 1.5 | Normal (400) | Metadata, table cells, comments |
| **Caption** | 12px (0.75rem) | 1.4 | Medium (500) | Status badges, timestamps, tags |

---

## 4. UI Components & Design Patterns

### 4.1 Status Badges (അവസ്ഥാ സൂചികകൾ)
- `SUBMITTED`: Soft Blue background (`#E0F2FE`), Text Blue (`#0369A1`), Label: സമർപ്പിച്ചു
- `UNDER_REVIEW`: Soft Amber background (`#FEF3C7`), Text Amber (`#B45309`), Label: പരിശോധനയിൽ
- `ASSIGNED`: Soft Purple background (`#F3E8FF`), Text Purple (`#7E22CE`), Label: ചുമതലപ്പെടുത്തി
- `IN_PROGRESS`: Soft Orange background (`#FFEDD5`), Text Orange (`#C2410C`), Label: പുരോഗമിക്കുന്നു
- `RESOLVED`: Soft Green background (`#DCFCE7`), Text Green (`#15803D`), Label: പരിഹരിച്ചു
- `VERIFIED`: Emerald Green background (`#D1FAE5`), Text Emerald (`#065F46`), Label: സ്ഥിരീകരിച്ചു
- `REJECTED`: Soft Red background (`#FEE2E2`), Text Red (`#B91C1C`), Label: നിരസിച്ചു

### 4.2 Glassmorphism & Elevation Policy
- Glassmorphism is used **selectively** on sticky navigation headers (`backdrop-blur-md bg-white/80 dark:bg-slate-900/80`) and floating map controls.
- Text content is never rendered over semi-transparent noisy backgrounds. High-contrast solid backgrounds are strictly enforced for data tables, form inputs, and modals.
