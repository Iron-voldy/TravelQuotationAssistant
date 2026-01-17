// Cloudflare Pages Advanced Mode Worker
// This handles all requests and proxies /api/* to the backend

const BACKEND_URL = 'https://stagev2.appletechlabs.com/api';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Check if this is an API proxy request
        if (url.pathname.startsWith('/api/proxy')) {
            return handleProxy(request, url);
        }

        // For all other requests, serve static assets
        // This passes the request to Cloudflare's static asset handling
        return env.ASSETS.fetch(request);
    }
};

async function handleProxy(request, url) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
                'Access-Control-Allow-Credentials': 'true',
            },
        });
    }

    try {
        // Get the path from query parameter
        const path = url.searchParams.get('path') || '';
        const targetUrl = `${BACKEND_URL}${path}`;

        console.log('[PROXY] Method:', request.method);
        console.log('[PROXY] Target URL:', targetUrl);

        // Prepare headers for backend request
        const headers = new Headers();
        headers.set('Accept', request.headers.get('Accept') || 'application/json');
        headers.set('User-Agent', 'Cloudflare-Proxy/1.0');

        // Forward Authorization header if present
        const authHeader = request.headers.get('Authorization');
        if (authHeader) {
            headers.set('Authorization', authHeader);
        }

        // Forward Content-Type for POST/PUT requests
        const contentType = request.headers.get('Content-Type');
        if (contentType) {
            headers.set('Content-Type', contentType);
        }

        // Prepare request options
        const requestOptions = {
            method: request.method,
            headers: headers,
        };

        // For POST/PUT/PATCH requests, forward the body
        if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
            requestOptions.body = await request.arrayBuffer();
        }

        // Make request to backend
        const response = await fetch(targetUrl, requestOptions);

        console.log('[PROXY] Response status:', response.status);

        // Get response body
        const responseBody = await response.arrayBuffer();

        // Create response headers with CORS
        const responseHeaders = new Headers();

        // Copy relevant headers from backend response
        const headersToForward = ['content-type', 'cache-control', 'etag'];
        headersToForward.forEach(header => {
            const value = response.headers.get(header);
            if (value) {
                responseHeaders.set(header, value);
            }
        });

        // Add CORS headers
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

        return new Response(responseBody, {
            status: response.status,
            headers: responseHeaders,
        });

    } catch (error) {
        console.error('[PROXY] Error:', error);
        return new Response(JSON.stringify({
            error: 'Proxy error',
            message: error.message,
            details: 'Failed to connect to backend server'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
