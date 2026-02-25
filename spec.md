# Specification

## Summary
**Goal:** Audit and repair the LottoCoin frontend so that no page renders as a blank white screen — fixing routing, auth context, actor initialization, React Query setup, layout components, and CSS theme visibility.

**Planned changes:**
- Fix App.tsx router configuration so all user-facing routes (`/`, `/login`, `/register`, `/dashboard`, `/lotteries`, `/lotteries/:id/buy`, `/my-tickets`, `/add-balance`, `/withdraw`, `/transactions`, `/results/:lotteryId`) and all admin routes (`/admin/*`) are correctly registered and render their page components
- Fix AuthContext so Internet Identity login correctly fetches the user profile, stores it in context, redirects unauthenticated users to `/login`, and prevents flash of unauthenticated UI on reload
- Fix the Navbar to render on every page via a root-level layout, showing the correct content for unauthenticated, authenticated, and admin users
- Fix the admin panel layout so all admin sub-pages are accessible via sidebar navigation links, with a shared admin layout wrapper applied to all `/admin/*` routes, and non-admin users redirected away
- Fix all React Query hooks in `useQueries.ts` to add `enabled: !!actor` guards so queries do not execute with a null actor, and display loading states while the actor initialises
- Fix `QueryClientProvider` to be correctly mounted at the app root, add error fallback UI for failed queries, and configure `QueryClient` with `retry: 1` and an appropriate `staleTime`
- Fix `index.css` and `tailwind.config.js` to correctly apply the dark gold theme CSS custom properties, ensuring body background and text colors are visible and the root div fills the viewport

**User-visible outcome:** All pages and the admin panel render correctly without blank white screens; navigation, authentication flow, and data loading all work as expected with visible loading and error states.
