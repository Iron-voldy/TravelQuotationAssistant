// Vercel Serverless Function to proxy API requests and bypass CORS
// This acts as a middleware between the frontend and backend

const BACKEND_URL = 'https://stagev2.appletechlabs.com/api';

// Disable body parsing to get raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to parse raw body buffer
const getRawBody = (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
};

module.exports = async (req, res) => {
  // Enable CORS for all origins (or restrict to your domain)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get the path from the query parameter
    const path = req.query.path || '';
    const targetUrl = `${BACKEND_URL}${path}`;

    console.log('[PROXY] Method:', req.method);
    console.log('[PROXY] Target URL:', targetUrl);
    console.log('[PROXY] Content-Type:', req.headers['content-type']);

    // Prepare headers for backend request
    const headers = {
      'Accept': req.headers.accept || 'application/json',
      'User-Agent': 'Vercel-Proxy/1.0'
    };

    // Forward Authorization header if present
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // Prepare request options
    const options = {
      method: req.method,
      headers: headers
    };

    // For POST/PUT requests, forward the body
    if (req.method === 'POST' || req.method === 'PUT') {
      // Get raw body
      const rawBody = await getRawBody(req);

      console.log('[PROXY] Raw body length:', rawBody.length);

      // Forward content-type and body as-is
      if (req.headers['content-type']) {
        headers['Content-Type'] = req.headers['content-type'];
        options.body = rawBody;
      } else {
        // If no content-type, assume it's form data
        options.body = rawBody;
      }
    }

    // Make request to backend
    const response = await fetch(targetUrl, options);

    console.log('[PROXY] Response status:', response.status);

    // Get response body
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Forward response to client
    res.status(response.status);

    // Copy relevant headers from backend response
    const headersToForward = ['content-type', 'cache-control', 'etag'];
    headersToForward.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        res.setHeader(header, value);
      }
    });

    // Send response
    if (typeof data === 'string') {
      res.send(data);
    } else {
      res.json(data);
    }

  } catch (error) {
    console.error('[PROXY] Error:', error);
    res.status(500).json({
      error: 'Proxy error',
      message: error.message,
      details: 'Failed to connect to backend server'
    });
  }
};
