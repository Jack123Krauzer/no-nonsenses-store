/**
 * Admin authentication helper (server-only)
 * Validates the admin secret token from request headers or cookies.
 */
import "server-only";

export const ADMIN_SESSION_COOKIE = "admin_token";

const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN;

export function isAdminConfigured(): boolean {
  return Boolean(ADMIN_SECRET_TOKEN);
}

export function isValidAdminSession(
  sessionToken: string | undefined
): boolean {
  if (!ADMIN_SECRET_TOKEN || !sessionToken) {
    return false;
  }

  return sessionToken === ADMIN_SECRET_TOKEN;
}

export function isAdminAuthenticated(request: Request): boolean {
  if (!ADMIN_SECRET_TOKEN) {
    return false;
  }

  const authHeader = request.headers.get("x-admin-token");
  const cookieHeader = request.headers.get("cookie");

  // Check header token
  if (authHeader && authHeader === ADMIN_SECRET_TOKEN) {
    return true;
  }

  // Check cookie token
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");

        return [
          k,
          decodeURIComponent(v.join("=")),
        ];
      })
    );

    if (cookies[ADMIN_SESSION_COOKIE] === ADMIN_SECRET_TOKEN) {
      return true;
    }
  }

  return false;
}

export function unauthorizedResponse(): Response {
  return Response.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}