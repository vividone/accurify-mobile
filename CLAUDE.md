# Accurify Mobile

Mobile-optimized PWA. React 18, TypeScript, Vite, Tailwind CSS, Headless UI.

## Commands

```bash
npm run dev           # Dev server on :5174
npm run build         # tsc + vite build
npm run lint          # ESLint
npm run test          # Vitest
```

## Directory Structure

```
src/
├── pages/             # 19 feature modules (auth, dashboard, invoices, bills, products, orders...)
├── router.tsx         # Central router config with protected routes
├── queries/           # 30 React Query hook files
├── services/api/      # Domain API client files
├── store/             # 5 Zustand stores (auth, business, subscription, ui)
├── components/
│   ├── auth/          # Auth components
│   ├── layout/        # Mobile shell, bottom tabs, FAB
│   └── ui/            # Shared UI components
├── hooks/             # usePWAInstall, usePullToRefresh
├── types/             # Type definitions
├── data/              # Static data
└── utils/             # Utilities
```

## Routes

- Public: `/login`, `/register`, `/forgot-password`, `/terms`, `/privacy`
- Protected `/app/*`: dashboard, invoices, bills, clients, products, pos, orders, stock, transactions, reports, tax, notifications, settings, help

## Patterns

- Tailwind CSS for styling (NOT Carbon Design - mobile uses Tailwind)
- Headless UI + Heroicons for components
- Same Zustand stores and React Query patterns as accurify-web
- PWA with install-to-home-screen support
- Pull-to-refresh on list pages
- Bottom tab navigation with floating action button (FAB)
- WhatsApp sharing for invoices/receipts
