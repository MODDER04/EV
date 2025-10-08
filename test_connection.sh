#!/bin/bash

echo "🔧 EvMaster Workshop - Connection Test"
echo "======================================"

# Check if backend is running
echo "1. Testing backend health..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "   ✅ Backend is running at http://localhost:8000"
    echo "   📊 Health status: $(curl -s http://localhost:8000/health)"
else
    echo "   ❌ Backend is NOT running"
    echo "   💡 Start it with: cd backend && source venv/bin/activate && python main.py"
    exit 1
fi

echo ""

# Test login endpoint
echo "2. Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"client_code":"DEMO123"}')

if [[ $LOGIN_RESPONSE == *"access_token"* ]]; then
    echo "   ✅ Login endpoint working"
    echo "   🔑 Response: $LOGIN_RESPONSE"
else
    echo "   ❌ Login endpoint failed"
    echo "   🔍 Response: $LOGIN_RESPONSE"
fi

echo ""

# Display network info
echo "3. Network Information:"
echo "   🏠 Localhost: http://localhost:8000"
echo "   📱 Android Emulator: http://10.0.2.2:8000"
echo "   🍎 iOS Simulator: http://localhost:8000"
echo "   📖 API Documentation: http://localhost:8000/docs"

# Get computer IP for physical devices
echo ""
echo "4. For Physical Devices:"
if command -v ifconfig &> /dev/null; then
    COMPUTER_IP=$(ifconfig | grep -E 'inet.*broadcast' | awk '{print $2}' | head -1)
    if [[ -n $COMPUTER_IP ]]; then
        echo "   🖥️  Your computer IP: $COMPUTER_IP"
        echo "   📱 Physical device URL: http://$COMPUTER_IP:8000"
    else
        echo "   ⚠️  Could not detect IP address"
    fi
else
    echo "   ⚠️  ifconfig not available - check manually"
fi

echo ""
echo "5. Flutter App Configuration:"
echo "   📁 File: client/lib/config/api_config.dart"
echo "   🎯 Current config should auto-detect platform"

echo ""
echo "🎉 Connection test complete!"
echo "💡 If Flutter app shows 'Connection refused', check the troubleshooting guide:"
echo "   📄 CONNECTION_TROUBLESHOOTING.md"