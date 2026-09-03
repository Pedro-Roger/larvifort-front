# LarviFort Visual Redesign — Design Spec

## Overview

Complete visual overhaul of the LarviFort CRM frontend. Corporate/professional style (HubSpot, Salesforce-inspired) with a custom blue design system, dark sidebar with blur effects, high information density, and full light/dark mode support.

**Date**: 2026-09-03
**Status**: Approved

---

## Design System

### Color Palette

#### Light Theme
| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#2563eb` (blue-600) | Primary actions, buttons, links |
| `--primary-hover` | `#1d4ed8` (blue-700) | Hover states |
| `--primary-light` | `#eff6ff` (blue-50) | Subtle backgrounds, badges |
| `--background` | `#f8fafc` (slate-50) | App background |
| `--card` | `#ffffff` | Card backgrounds |
| `--border` | `#e2e8f0` (slate-200) | Borders |
| `--text` | `#0f172a` (slate-900) | Primary text |
| `--text-muted` | `#64748b` (slate-500) | Secondary text |

#### Dark Theme
| Token | Value |
|-------|-------|
| `--background` | `#0f172a` (slate-900) |
| `--card` | `#1e293b` (slate-800) |
| `--border` | `#334155` (slate-700) |
| `--text` | `#f1f5f9` (slate-100) |
| `--text-muted` | `#94a3b8` (slate-400) |

#### Sidebar
| Token | Value |
|-------|-------|
| `--sidebar-bg` | `#0f172a` (slate-900) |
| `--sidebar-hover` | `#1e293b` (slate-800) |
| `--sidebar-active` | `#2563eb` (blue-600) |

#### Status Colors (Kanban)
| Stage | Color |
|-------|-------|
| Orçamento | `#64748b` (slate) |
| Negociação | `#2563eb` (blue) |
| Aprovado | `#16a34a` (green) |
| Produção | `#ea580c` (orange) |
| Pronto | `#8b5cf6` (violet) |
| Entregue | `#059669` (emerald) |

### Typography
- **Primary font**: Inter (400, 500, 600, 700)
- **Headings**: `font-semibold` or `font-bold`
- **Body**: `text-sm` (14px) default, `text-xs` (12px) for dense areas
- **Labels**: `text-xs font-medium uppercase tracking-wide text-slate-500`

### Spacing
- Page padding: `p-4` (dense) or `p-6` (standard)
- Card padding: `p-3` (compact) or `p-4` (standard)
- Component gap: `gap-3` (dense) or `gap-4` (standard)
- Section gap: `space-y-4` or `space-y-6`

### Border Radius
- Cards: `rounded-lg` (8px)
- Buttons: `rounded-md` (6px)
- Badges: `rounded-full`
- Inputs: `rounded-md` (6px)
- Modals: `rounded-xl` (12px)

### Shadows
- Cards: `shadow-sm`
- Cards hover: `shadow-md`
- Dropdowns: `shadow-lg`
- Modals: `shadow-xl`

---

## Component Specifications

### Sidebar
- **Width**: 260px expanded, 64px collapsed
- **Background**: `#0f172a` with `backdrop-blur-xl` and subtle gradient `from-slate-900 via-slate-800 to-slate-900`
- **Logo**: White text "LarviFort", smaller badge "CRM AquaFund"
- **Avatar**: `w-8 h-8`, border `ring-2 ring-amber-500`, bg `bg-blue-600`
- **Nav items**: `text-slate-300`, hover `bg-white/5 text-white`, active `bg-blue-600 text-white`
- **Icons**: 18px, `text-slate-400` inactive
- **Separators**: `border-white/10`
- **Collapse**: `ChevronLeft/ChevronRight` at bottom
- **Transition**: `transition-all duration-200`

### Layout
- **Background**: `bg-slate-50` (light) / `bg-slate-900` (dark)
- **Page header**: `bg-white border-b border-slate-200 px-6 py-4`
- **Content**: `p-4` or `p-6` with overflow auto

### Cards
- **Background**: `bg-white` (light) / `bg-slate-800` (dark)
- **Border**: `border border-slate-200 rounded-lg`
- **Shadow**: `shadow-sm`, `hover:shadow-md hover:border-blue-200`
- **Padding**: `p-4` standard, `p-3` compact

### Buttons
- **Primary**: `bg-blue-600 text-white hover:bg-blue-700 shadow-sm rounded-md font-medium text-sm`
- **Secondary**: `bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-md font-medium text-sm`
- **Ghost**: `text-slate-600 hover:bg-slate-100 rounded-md font-medium text-sm`
- **Destructive**: `bg-red-600 text-white hover:bg-red-700 rounded-md font-medium text-sm`

### Inputs
- **Height**: `h-9` (36px)
- **Border**: `border-slate-300 rounded-md text-sm`
- **Focus**: `ring-2 ring-blue-500/20 border-blue-500`
- **Placeholder**: `text-slate-400`

### Badges
- **Style**: `rounded-full px-2.5 py-0.5 text-xs font-medium`
- **Colors**: Context-based (priority, status)

### Tables (High Density)
- **Header**: `bg-slate-50 text-slate-600 text-xs font-medium uppercase`
- **Rows**: `border-b border-slate-100 hover:bg-slate-50`
- **Cells**: `px-4 py-2.5 text-sm`

---

## Page Specifications

### Kanban Board
- **Column width**: 320px fixed
- **Column background**: `bg-slate-50` (light) / `bg-slate-800/50` (dark)
- **Column border**: `border border-slate-200 rounded-lg`
- **Column header**: `px-3 py-2.5` with `border-b border-slate-200`
- **Top bar**: `h-1` (4px) with stage color
- **Count badge**: `bg-slate-200 text-slate-600 rounded-full px-2 py-0.5 text-xs`
- **Value**: `text-xs font-semibold text-blue-600`
- **Task card**: `bg-white border border-slate-200 rounded-lg p-3`
- **Card hover**: `hover:border-blue-300 hover:shadow-sm`
- **Drag**: `cursor-grab`, `opacity-80` when dragging
- **Avatar**: `w-7 h-7`, `ring-2 ring-white`
- **Title**: `text-sm font-medium text-slate-900`
- **Description**: `text-xs text-slate-500 line-clamp-2`
- **Priority**: `text-[10px] uppercase font-semibold`
- **Add card**: `border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50`

### Kanban Header
- **Background**: `bg-white border-b border-slate-200`
- **Title**: `text-base font-semibold`
- **Stats**: Compact badges `text-xs`
- **Search**: `h-8 text-sm w-64`
- **Actions**: Ghost buttons with icons

### Projects Page
- **Grid**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`
- **Card**: White bg, `border-slate-200 rounded-lg`
- **Icon**: `w-10 h-10 rounded-lg bg-blue-50 text-blue-600`
- **Name**: `text-sm font-semibold`
- **Board count**: `text-xs text-slate-500`

### Modals
- **Overlay**: `bg-black/50 backdrop-blur-sm`
- **Content**: `rounded-xl shadow-xl max-w-lg`
- **Header**: `border-b border-slate-100 pb-4`
- **Footer**: `border-t border-slate-100 pt-4`

### TaskDetailModal
- **Width**: `max-w-2xl`
- **Tabs**: Detalhes | Subtarefas | Atividade
- **Labels**: `text-xs font-medium text-slate-500 uppercase`
- **Fields**: `bg-slate-50 rounded-lg p-3`

---

## Implementation Strategy

### Phase 1: Theme System (index.css + tailwind config)
- Replace CSS variables with new blue palette
- Add dark mode variables
- Update font configuration

### Phase 2: Sidebar (AppSidebar.tsx)
- Convert inline styles to Tailwind classes
- Apply dark background with blur effect
- Update nav item styles

### Phase 3: Layout (MainLayout.tsx)
- Apply new background colors
- Update page structure

### Phase 4: Components (ui/ folder)
- Update Button, Input, Badge styles
- Update Dialog, Dropdown styles
- Add new table components if needed

### Phase 5: Kanban Components
- Update Column, TaskCard, BoardContainer
- Update KanbanHeader, AddColumn
- Update modals (TaskModal, TaskDetailModal)

### Phase 6: Projects Page
- Update ProjectsPage grid and cards
- Update ProjectCard component

### Phase 7: Dark Mode Toggle
- Add theme provider
- Add toggle button in sidebar/header
- Test all components in dark mode

---

## Files to Modify

1. `src/index.css` — CSS variables, theme tokens
2. `src/components/layout/AppSidebar.tsx` — Complete restyle
3. `src/components/layout/MainLayout.tsx` — Background, structure
4. `src/components/ui/button.tsx` — Button variants
5. `src/components/ui/input.tsx` — Input styling
6. `src/components/ui/badge.tsx` — Badge variants
7. `src/components/ui/dialog.tsx` — Modal styling
8. `src/components/ui/dropdown-menu.tsx` — Dropdown styling
9. `src/components/kanban/Column.tsx` — Column card style
10. `src/components/kanban/TaskCard.tsx` — Task card style
11. `src/components/kanban/BoardContainer.tsx` — Board background
12. `src/components/kanban/KanbanHeader.tsx` — Header style
13. `src/components/kanban/AddColumn.tsx` — Add column style
14. `src/components/kanban/modals/TaskDetailModal.tsx` — Modal style
15. `src/pages/ProjectsPage.tsx` — Projects grid/cards
16. `src/pages/KanbanPage.tsx` — Page structure
