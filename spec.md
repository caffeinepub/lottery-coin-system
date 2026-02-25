# Specification

## Summary
**Goal:** Add an "Admin Panel" link to the Navbar that is only visible to authenticated admin users.

**Planned changes:**
- Update the Navbar component to show an "Admin Panel" link when the logged-in user has `role=admin`
- The link navigates to `/admin/dashboard`
- Style the link with gold/amber accent color and hover highlight, consistent with the existing gold-and-dark theme
- Hide the link from non-admin and unauthenticated users

**User-visible outcome:** Admin users see an "Admin Panel" link in the Navbar on every page, allowing quick access to the admin dashboard. Non-admin and unauthenticated users see no change.
