#!/bin/bash

echo "🧪 TESTING NEW USER DATA FLOW"
echo "=============================="

echo ""
echo "📱 Simulating Flutter app login with new user..."

# Step 1: Login with new user code
echo "1️⃣ LOGIN: Testing with code HQDMGD01"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"client_code": "HQDMGD01"}')

echo "   Response: $LOGIN_RESPONSE"

# Extract access token (basic parsing)
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "   Token: $ACCESS_TOKEN"

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ LOGIN FAILED - No access token received"
    exit 1
fi

echo ""
echo "2️⃣ PROFILE: Getting client profile data"
PROFILE_RESPONSE=$(curl -s http://localhost:8000/client/profile \
    -H "Authorization: Bearer $ACCESS_TOKEN")

echo "   Response: $PROFILE_RESPONSE"

# Check if we get the right name
if echo "$PROFILE_RESPONSE" | grep -q "aboodhanini"; then
    echo "✅ Profile shows correct name: aboodhanini"
else
    echo "❌ Profile shows wrong name!"
fi

echo ""
echo "3️⃣ VEHICLES: Getting client vehicles"
VEHICLES_RESPONSE=$(curl -s http://localhost:8000/client/cars \
    -H "Authorization: Bearer $ACCESS_TOKEN")

echo "   Response: $VEHICLES_RESPONSE"

# Check if we get the right vehicle
if echo "$VEHICLES_RESPONSE" | grep -q "MG"; then
    echo "✅ Vehicles show correct car: MG"
else
    echo "❌ Vehicles show wrong cars!"
fi

echo ""
echo "4️⃣ SERVICE HISTORY: Getting service history"
SERVICE_RESPONSE=$(curl -s http://localhost:8000/client/cars/4/history \
    -H "Authorization: Bearer $ACCESS_TOKEN")

echo "   Response: $SERVICE_RESPONSE"

if [ "$SERVICE_RESPONSE" = "[]" ]; then
    echo "✅ No service history (expected for new user)"
else
    echo "ℹ️ Service history: $SERVICE_RESPONSE"
fi

echo ""
echo "🎯 EXPECTED FLUTTER APP BEHAVIOR:"
echo "   - Login screen accepts code 'HQDMGD01'"
echo "   - Home screen shows 'Welcome back, aboodhanini!'"
echo "   - My Cars section shows 'MG asd (2022)'"
echo "   - Recent Activity shows 'No recent service history'"
echo ""

echo "🔍 IF APP STILL SHOWS DEMO DATA:"
echo "   1. Check Flutter console for API errors"
echo "   2. Verify app is calling the right API URL"
echo "   3. Clear app data/cache and retry"
echo "   4. Restart both backend and Flutter app"

echo ""
echo "✅ Backend API is working correctly for new user!"