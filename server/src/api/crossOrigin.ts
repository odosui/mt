import { type IncomingHttpHeaders } from "http";
import { type RequestHandler } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

type RequestInfo = { method: string; headers: IncomingHttpHeaders };

// Blocks state-changing requests that a browser sends on behalf of another
// site (CSRF). Requests without browser headers (curl, scripts) pass.
export function isCrossOriginWrite(
  { method, headers }: RequestInfo,
  trustedOrigins: string[],
): boolean {
  if (SAFE_METHODS.has(method.toUpperCase())) return false;

  const origin = headers.origin;
  if (origin && trustedOrigins.includes(origin)) return false;

  const secFetchSite = firstValue(headers["sec-fetch-site"]);
  if (secFetchSite) {
    return secFetchSite !== "same-origin" && secFetchSite !== "none";
  }

  if (!origin) return false;
  return hostOf(origin) !== headers.host;
}

export function rejectCrossOriginWrites(
  trustedOrigins: string[],
): RequestHandler {
  return (req, res, next) => {
    if (isCrossOriginWrite(req, trustedOrigins)) {
      res.status(403).json({ error: "Cross-origin request rejected" });
      return;
    }
    next();
  };
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function hostOf(origin: string): string | null {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}
