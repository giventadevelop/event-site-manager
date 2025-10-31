import type { NextApiRequest, NextApiResponse } from "next";
import { getCachedApiJwt } from "@/lib/api/jwt";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!API_BASE_URL) {
    res.status(500).json({ error: "API base URL not configured" });
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const token = await getCachedApiJwt();
  // Forward all query params
  const params = new URLSearchParams();
  for (const key in req.query) {
    const value = req.query[key];
    if (Array.isArray(value)) value.forEach(v => params.append(key, v));
    else if (typeof value !== 'undefined') params.append(key, value);
  }
  let apiUrl = `${API_BASE_URL}/api/event-medias/upload-multiple`;
  const qs = params.toString();
  if (qs) apiUrl += `?${qs}`;

  const fetch = (await import("node-fetch")).default;
  // Convert headers to a plain object to avoid Next.js 15+ iteration issues
  const headersObj: Record<string, string | string[]> = {};
  req.headers.forEach((value, key) => {
    headersObj[key] = value;
  });
  const headers = { ...headersObj, authorization: `Bearer ${token}` };
  delete headers["host"];
  delete headers["connection"];
  // Sanitize headers
  const sanitizedHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) sanitizedHeaders[key] = value.join("; ");
    else if (typeof value === "string") sanitizedHeaders[key] = value;
  }
  const apiRes = await fetch(apiUrl, {
    method: "POST",
    headers: sanitizedHeaders,
    body: req,
  });
  res.status(apiRes.status);
  apiRes.body.pipe(res);
}