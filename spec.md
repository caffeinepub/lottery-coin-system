# Specification

## Summary
**Goal:** Add a secure, separate admin login system with role-based access control to the LuckyCoins Lottery app.

**Planned changes:**
- Add a dedicated Admin Login page at `/admin/login` with an admin ID + password form (no Internet Identity), styled with the gold-and-dark theme
- Add a subtle "Admin Portal" link on the main `/login` page and a "Back to User Login" link on the admin login page
- Add a backend `adminLogin(adminId, password)` endpoint that validates credentials against a stored hash and returns a short-lived session token stored in stable state
- Add an `initAdminCredentials` function callable only once or by the controller to set the admin ID and hashed password
- Update all existing admin-only backend endpoints to validate the admin session token, returning `#err(#unauthorized)` if missing, expired, or invalid
- Store the admin session token in AuthContext and localStorage after successful login, and pass it to all admin API calls
- Add an `adminLogout` function in AuthContext that clears the admin token and redirects to `/admin/login`
- Protect all `/admin/*` routes by checking for a valid admin session token, redirecting to `/admin/login` if absent

**User-visible outcome:** Administrators can log in via a dedicated admin portal using an admin ID and password, gaining access to the admin dashboard. Regular users are unaffected, and all admin endpoints are protected by the session token.
