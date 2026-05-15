/**
 * Public origin for CORS, callbacks, etc.
 * On Vercel, never fall through to localhost when AUTH_URL points at localhost by mistake.
 */
export function getPublicAppOrigin(): string {
  const authUrl = process.env.AUTH_URL?.replace(/\/$/, "");
  const nextAuthUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "");
  const vercelHost = process.env.VERCEL_URL;

  if (vercelHost) {
    const fromVercel = `https://${vercelHost}`;
    const looksLocal =
      authUrl?.includes("localhost") ||
      nextAuthUrl?.includes("localhost") ||
      (!authUrl && !nextAuthUrl);
    if (looksLocal) return fromVercel;
  }

  if (authUrl) return authUrl;
  if (nextAuthUrl) return nextAuthUrl;
  return "http://localhost:3000";
}
