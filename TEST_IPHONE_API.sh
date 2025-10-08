#!/bin/bash

MACBOOK_IP="192.168.100.126"
CLIENT_CODE="HQDMGD01"

echo "📱 TESTING iPhone API CONNECTIVITY"
echo "=================================="
echo "MacBook IP: $MACBOOK_IP"
echo "User Code: $CLIENT_CODE"
echo ""

# Test 1: Health check
echo "1️⃣ HEALTH CHECK: Testing if iPhone can reach backend"
HEALTH_RESPONSE=$(curl -s -m 5 http://$MACBOOK_IP:8000/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Backend is reachable at $MACBOOK_IP:8000"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "❌ Backend NOT reachable at $MACBOOK_IP:8000"
    echo "   Possible issues:"
    echo "   - MacBook firewall blocking port 8000"
    echo "   - Different WiFi networks" 
    echo "   - Backend not running with host=0.0.0.0"
    exit 1
fi

echo ""

# Test 2: Login
echo "2️⃣ LOGIN: Testing authentication"
LOGIN_RESPONSE=$(curl -s -m 10 -X POST http://$MACBOOK_IP:8000/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"client_code\": \"$CLIENT_CODE\"}")

echo "   Response: $LOGIN_RESPONSE"

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
if [ -n "$ACCESS_TOKEN" ]; then
    echo "✅ Login successful, token received"
else
    echo "❌ Login failed"
    exit 1
fi

echo ""

# Test 3: Profile data
echo "3️⃣ PROFILE: Getting user data"
PROFILE_RESPONSE=$(curl -s -m 10 http://$MACBOOK_IP:8000/client/profile \
    -H "Authorization: Bearer $ACCESS_TOKEN")

echo "   Response: $PROFILE_RESPONSE"

if echo "$PROFILE_RESPONSE" | grep -q "aboodhanini"; then
    echo "✅ Profile data correct: aboodhanini"
else
    echo "❌ Profile data incorrect or missing"
fi

echo ""

# Test 4: Vehicles
echo "4️⃣ VEHICLES: Getting vehicle data"
VEHICLES_RESPONSE=$(curl -s -m 10 http://$MACBOOK_IP:8000/client/cars \
    -H "Authorization: Bearer $ACCESS_TOKEN")

echo "   Response: $VEHICLES_RESPONSE"

if echo "$VEHICLES_RESPONSE" | grep -q "MG"; then
    echo "✅ Vehicle data correct: MG"
else
    echo "❌ Vehicle data incorrect or missing"
fi

echo ""
echo "🎯 FLUTTER APP SHOULD NOW WORK WITH:"
echo "   - Your iPhone connected to same WiFi"
echo "   - Flutter app automatically using $MACBOOK_IP:8000"
echo "   - Login code: $CLIENT_CODE"
echo "   - Expected result: 'Welcome back, aboodhanini!' + MG vehicle"

echo ""
echo "🔧 IF iPhone APP STILL DOESN'T WORK:"
echo "   1. Restart Flutter app completely"
echo "   2. Check iPhone is on same WiFi as MacBook"
echo "   3. Try disabling MacBook firewall temporarily"
echo "   4. Verify Flutter console shows: 'http://$MACBOOK_IP:8000'"

echo ""
echo "✅ Backend is ready for iPhone connection!"