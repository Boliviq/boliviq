# Implementation — Department 08

## Pages added
- src/pages/Analytics.jsx — parallel loads of 4 entities, useMemo aggregations, KPI grid + chart grid.

## Components added
- src/components/analytics/CategoryPie.jsx — reusable donut chart with legend (8-color palette).
- src/components/analytics/BudgetBar.jsx — grouped bar (budget vs spent) with $k axis formatting.

## Files modified
- src/App.jsx — import + `/analytics` route.
- src/components/AppTopBar.jsx — NAV (Analytics added after Dashboard).

## Reused
- workspaceContext; recharts; lucide icons; shadcn-free card styling (token classes).