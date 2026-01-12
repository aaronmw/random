/**
 * Get the admin user ID for development mode.
 * Falls back to a default admin user ID if not set in environment variables.
 */
export function getAdminUserId(): string | null {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  // Use admin user ID from environment variable, or fall back to default
  const adminUserId =
    process.env.NEXT_PUBLIC_ADMIN_USER_ID || '321070720595916577'

  return adminUserId
}
