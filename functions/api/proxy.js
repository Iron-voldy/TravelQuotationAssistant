// Cloudflare Pages Function to proxy API requests and bypass CORS
// This replaces Vercel's serverless function for Cloudflare hosting

const BACKEND_URL = 'https://ai.appleholidaysds.com/api';

export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);

    // Handle CORS preflight requests
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
        console.log('[PROXY] Content-Type:', request.headers.get('Content-Type'));

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

        // For POST/PUT requests, forward the body
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
