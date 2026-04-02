#!/bin/bash

echo "=========================================="
echo "Library Management System - Deployment"
echo "=========================================="
echo ""

cd /home/ubuntu/library-system

# Test MongoDB connection
echo "1️⃣  Testing MongoDB connection..."
timeout 10 node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log('✅ MongoDB connection successful!'); process.exit(0); })
  .catch(err => { console.log('❌ MongoDB connection failed:', err.message); process.exit(1); });
" 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "2️⃣  Seeding database..."
    npm run seed
    
    echo ""
    echo "3️⃣  Starting server..."
    echo "Server will run in background on port 5000"
    
    # Kill any existing server on port 5000
    pkill -f "node server/server.js" 2>/dev/null
    
    # Start server in background
    nohup npm start > /tmp/server.log 2>&1 &
    SERVER_PID=$!
    
    echo "Server PID: $SERVER_PID"
    echo ""
    echo "Waiting for server to start..."
    sleep 5
    
    echo ""
    echo "4️⃣  Checking server status..."
    tail -20 /tmp/server.log
    
    echo ""
    echo "5️⃣  Testing server endpoint..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000)
    echo "HTTP Response Code: $HTTP_CODE"
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
        echo ""
        echo "=========================================="
        echo "✅ DEPLOYMENT SUCCESSFUL!"
        echo "=========================================="
        echo ""
        echo "🌐 Access your application at:"
        echo "   https://11a8ddaba7-5000.na104.preview.abacusai.app"
        echo ""
        echo "👤 Test Credentials:"
        echo "   Admin:   admin@library.com / admin123"
        echo "   Student: student1@library.com / student123"
        echo ""
        echo "📊 Server Logs:"
        echo "   tail -f /tmp/server.log"
        echo ""
        echo "🛑 Stop Server:"
        echo "   pkill -f 'node server/server.js'"
        echo "=========================================="
    else
        echo ""
        echo "⚠️  Server started but may have issues"
        echo "Check logs: tail -f /tmp/server.log"
    fi
else
    echo ""
    echo "=========================================="
    echo "❌ MongoDB Connection Failed"
    echo "=========================================="
    echo ""
    echo "Please ensure:"
    echo "1. IP 198.212.42.22 is whitelisted in MongoDB Atlas"
    echo "2. Or 0.0.0.0/0 is added to allow all IPs"
    echo "3. Wait 1-2 minutes after adding IP for changes to propagate"
    echo ""
    echo "MongoDB Atlas: https://cloud.mongodb.com/"
    echo "Navigate to: Network Access → IP Whitelist"
    echo "=========================================="
fi
