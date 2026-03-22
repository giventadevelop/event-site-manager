import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function buildQueryString(query: Record<string, any>) {
  const params = new URLSearchParams();
  for (const key in query) {
    if (key !== 'id') params.append(key, query[key]);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!API_BASE_URL) {
    res.status(500).json({ error: 'API base URL not configured' });
    return;
  }

  const { method, query, body } = req;
  const slug = (req.query.slug || []) as string[];
  const queryString = buildQueryString(query);
  if (!slug.length) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const apiUrl = `${API_BASE_URL}/api/ticket-transactions/${slug.join('/')}${queryString}`;
  let apiRes;
  switch (method) {
    case 'GET':
      apiRes = await fetchWithJwtRetry(apiUrl, { method: 'GET' }, 'ticket-transactions-slug-GET');
      break;
    case 'PUT':
      apiRes = await fetchWithJwtRetry(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }, 'ticket-transactions-slug-PUT');
      break;
    case 'DELETE':
      apiRes = await fetchWithJwtRetry(apiUrl, { method: 'DELETE' }, 'ticket-transactions-slug-DELETE');
      break;
    default:
      res.status(405).json({ error: 'Method not allowed' });
      return;
  }
  const data = await apiRes.text();
  res.status(apiRes.status).send(data);
}