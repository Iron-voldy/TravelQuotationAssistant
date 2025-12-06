#!/bin/bash
# Quick Start - Run This to Get Started!

echo "🚀 Travel Quotation Assistant - Local Development"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Install from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if setupProxy.js exists
if [ ! -f "src/setupProxy.js" ]; then
    echo "⚠️  Warning: src/setupProxy.js not found"
fi

# Show important info
echo "📋 Configuration:"
echo "   - Development Proxy: http://localhost:3000/api -> https://stagev2.appletechlabs.com/api"
echo "   - Login: http://localhost:3000/login"
echo "   - Register: http://localhost:3000/register"
echo ""

# Start the app
echo "🎬 Starting development server..."
echo ""
echo "To access from another machine:"
echo "   set HOST=0.0.0.0 && npm start"
echo "   Then visit: http://YOUR_IP:3000"
echo ""

npm start
