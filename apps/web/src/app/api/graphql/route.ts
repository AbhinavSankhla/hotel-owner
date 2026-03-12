/**
 * GraphQL Proxy Route
 * 
 * Proxies GraphQL requests from the browser to the API server.
 * This avoids cross-origin issues in environments like GitHub Codespaces
 * where port-forwarded URLs require authentication cookies that fetch() can't send.
 */

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

export async function POST(request: Request) {
  const body = await request.text();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Forward auth header
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  // Forward tenant headers
  for (const h of ['x-hotel-id', 'x-tenant-type', 'x-tenant-id']) {
    const val = request.headers.get(h);
    if (val) headers[h] = val;
  }

  const response = await fetch(BACKEND_URL, {
    method: 'POST',
    headers,
    body,
  });

  const data = await response.text();
  return new Response(data, {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
