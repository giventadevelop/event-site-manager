import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!API_BASE_URL) {
      res.status(500).json({ error: 'API base URL not configured' });
      return;
    }

    const { method, query, body } = req;
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    if (!allowedMethods.includes(method!)) {
      res.setHeader('Allow', allowedMethods);
      res.status(405).end(`Method ${method} Not Allowed`);
      return;
    }

    const slug = query.slug;

    // Build the backend path
    let path = '/api/user-profiles';
    let userIdFromPath: string | null = null;

    if (slug) {
      if (Array.isArray(slug)) {
        // Check if this is a /by-user/{userId} path
        if (slug.length === 2 && slug[0] === 'by-user') {
          userIdFromPath = slug[1];
          // Convert /by-user/{userId} to query parameter format (backend doesn't support path format)
          path = '/api/user-profiles'; // Remove /by-user/{userId} from path
        } else {
          path += '/' + slug.map(encodeURIComponent).join('/');
        }
      } else if (typeof slug === 'string') {
        // Single slug - check if it's a numeric ID or something else
        path += '/' + encodeURIComponent(slug);
      }
    }

    // Remove slug from query before building query string
    const { slug: _omit, ...restQuery } = query;
    const qs = new URLSearchParams(restQuery as Record<string, string>);

    // If we extracted userId from /by-user/{userId} path, add it as query parameter
    if (userIdFromPath) {
      if (!Array.from(qs.keys()).includes('userId.equals')) {
        qs.append('userId.equals', userIdFromPath);
        console.log('[UserProfile Proxy] Converted /by-user/ path to query parameter:', userIdFromPath);
      }
    }

    // Tenant-agnostic: do not inject tenantId from env; only forward what caller sent
    const queryString = qs.toString();
    const apiUrl = `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;

    console.log('[UserProfile Proxy] Forwarding to backend URL:', apiUrl);
    console.log('[UserProfile Proxy] Path:', path, '| Method:', method);

    // Make the initial request
    let apiRes = await fetchWithJwtRetry(apiUrl, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

        // Let the frontend handle profile creation - proxy should only forward requests
        // Profile creation is now handled by ApiServerActions.ts with proper validation

    // Forward x-total-count header for GET requests
    if (method === 'GET') {
      const totalCount = apiRes.headers.get('x-total-count');
      if (totalCount) {
        res.setHeader('x-total-count', totalCount);
      }
      const data = await apiRes.json();
      res.status(apiRes.status).json(data);
      return;
    }

    const data = await apiRes.text();
    res.status(apiRes.status).send(data);

  } catch (err) {
    console.error('[UserProfile Proxy ERROR]', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}

async function fetchWithJwtRetry(apiUrl: string, options: any = {}, debugLabel = '') {
  console.log('[fetchWithJwtRetry] Called with URL:', apiUrl);
  let token = await getCachedApiJwt();
  console.log('[fetchWithJwtRetry] Using JWT:', token);
  let response = await fetch(apiUrl, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  console.log('[fetchWithJwtRetry] Response status:', response.status);
  if (response.status === 401) {
    token = await generateApiJwt();
    console.log('[fetchWithJwtRetry] Retrying with new JWT:', token);
    response = await fetch(apiUrl, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('[fetchWithJwtRetry] Response status (after retry):', response.status);
  }
  return response;
}

export const config = {
  api: {
    bodyParser: false,
  },
};