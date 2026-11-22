/**
 * LifeCare Central Security & Super Admin Configuration
 * 
 * DESIGNATED ADMIN EMAIL ACCOUNTS:
 * Only Google accounts with emails matching this list (or marked as admin in
 * Cloud Firestore under `system_config/admins`) can access the OLED Admin Console at `/admin`.
 * 
 * To add a new Admin:
 * 1. Add their Google email address to the `AUTHORIZED_ADMIN_EMAILS` array below.
 * OR
 * 2. In Firebase Console -> Cloud Firestore, create a document in `admins` collection
 *    with document ID as the user's email (e.g. `admin@lifecare.gov.in`).
 */

export const AUTHORIZED_ADMIN_EMAILS: string[] = [
  'susheem27s25.52@gmail.com', // Primary Firebase Project Owner & Super Admin
  'admin@lifecare.gov.in',
  'director@emergency.gov.in',
];

/**
 * Validates whether an authenticated email has Super Admin privileges
 */
export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === normalized);
}
