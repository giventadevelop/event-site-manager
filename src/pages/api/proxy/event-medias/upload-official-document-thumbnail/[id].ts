import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getApiBaseUrl } from '@/lib/env';

const API_BASE_URL = getApiBaseUrl();

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Proxies multipart thumbnail upload to Spring:
 * POST /api/event-medias/{id}/upload-official-document-thumbnail
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!API_BASE_URL) {
      res.status(500).json({ error: 'API base URL not configured' });
      return;
    }

    const { id } = req.query;
    const mediaId = Array.isArray(id) ? id[0] : id;
    if (!mediaId) {
      res.status(400).json({ error: 'Media id is required' });
      return;
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    let token = await getCachedApiJwt();
    if (!token) {
      token = await generateApiJwt();
    }

    const apiUrl = `${API_BASE_URL}/api/event-medias/${mediaId}/upload-official-document-thumbnail`;
    const fetch = (await import('node-fetch')).default;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'] as string;
    }
    if (req.headers['content-length']) {
      headers['content-length'] = req.headers['content-length'] as string;
    }
    const xTenant = req.headers['x-tenant-id'];
    if (xTenant) {
      headers['x-tenant-id'] = Array.isArray(xTenant) ? xTenant[0] : xTenant;
    }

    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: req as unknown as import('node-fetch').BodyInit,
      duplex: 'half',
    });

    const text = await apiRes.text();
    res.status(apiRes.status);
    res.setHeader('Content-Type', apiRes.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch (err) {
    console.error('Proxy error (upload-official-document-thumbnail):', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
