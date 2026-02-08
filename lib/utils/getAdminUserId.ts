/**
 * Get the admin user ID.
 * Uses environment variable NEXT_PUBLIC_ADMIN_USER_ID if set,
 * otherwise falls back to default admin user ID.
 * Works in both development and production modes.
 */
export function getAdminUserId(): string | null {
  // Use admin user ID from environment variable, or fall back to default
  const adminUserId =
    process.env.NEXT_PUBLIC_ADMIN_USER_ID || '321070720595916577'

  return adminUserId
}
