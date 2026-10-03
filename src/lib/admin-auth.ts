/**
 * Admin authentication helper (server-only)
 * Validates the admin secret token from request headers.
 */
import "server-only";

const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN!;

export function isAdminAuthenticated(request: Request): boolean {
  const authHeader = request.headers.get("x-admin-token");
  const cookieHeader = request.headers.get("cookie");

  // Check header token
  if (authHeader && authHeader === ADMIN_SECRET_TOKEN) {
    return true;
  }

  // Check cookie token (set during login)
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, v.join("=")];
      })
    );
    if (cookies["admin_token"] === ADMIN_SECRET_TOKEN) {
      return true;
    }
  }

  return false;
}

export function unauthorizedResponse(): Response {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
