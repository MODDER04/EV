# 🐛 Flutter App Debug Guide - Demo Data Issue

## 🎯 Problem
New user "aboodhanini" with code "HQDMGD01" still sees demo data (John Doe, Mercedes-Benz, BMW) instead of real data (aboodhanini, MG asd).

## ✅ Backend Status: WORKING CORRECTLY
The API test confirms backend returns correct data:
- **Name**: aboodhanini  
- **Vehicle**: MG asd (2022)
- **Code**: HQDMGD01

## 🔍 Debugging Steps

### 1. Check Flutter Console Output

When you run the Flutter app, look for these debug messages:

```
🔑 AuthProvider: Attempting login with code: HQDMGD01
📋 AuthProvider: Login result: {access_token: token_HQDMGD01_4, ...}
✅ AuthProvider: Login successful for client ID: 4
🔑 User authenticated, force refreshing data...
🧽 Clearing all app data...
🔄 Starting loadRealData...
📞 Calling getClientProfile...
📋 Profile data received: {client_id: 4, name: aboodhanini, ...}
✅ Client set: aboodhanini
🚗 Calling getClientCars...
🚗 Vehicles data received: [{car_id: 4, make: MG, ...}]
✅ Vehicles loaded: 1 vehicles
  - MG asd (2022)
```

### 2. If You See Error Messages

Look for these error patterns:

**API Connection Error:**
```
❌ AuthProvider: Login error: SocketException: Connection refused
```
**Solution**: Ensure backend is running on `http://localhost:8000`

**Wrong API URL:**
```
❌ Profile data is null
❌ Vehicles data is null
```
**Solution**: Check if app is using correct API URL for your platform

**Token Issues:**
```
HTTP error! status: 401
```
**Solution**: Clear app data and login again

### 3. Force Clear App Data

If app still shows demo data, try these steps:

**Method 1: Hot Restart**
- In Flutter, press `R` for hot restart (not hot reload `r`)
- This completely restarts the app state

**Method 2: Clear App Storage**
- Uninstall and reinstall the app
- Or clear app data in device settings

**Method 3: Debug from Scratch**
- Stop Flutter app
- Kill backend: `lsof -ti:8000 | xargs kill -9` 
- Restart backend: `cd backend && python main.py`
- Start Flutter app fresh

### 4. Test Specific Scenarios

**Logout/Login Test:**
1. Login with demo code `DEMO123` (should show John Doe)
2. Go to Profile → Logout
3. Login with `HQDMGD01` (should show aboodhanini)

**Expected Behavior:**
- Step 1: Shows "Welcome back, John!" + Mercedes/BMW
- Step 3: Shows "Welcome back, aboodhanini!" + MG

### 5. Verify API URL Configuration

Check `lib/config/api_config.dart`:
- iOS Simulator: `http://localhost:8000` ✅
- Android Emulator: `http://10.0.2.2:8000` ✅
- Physical Device: `http://YOUR_IP:8000` ⚠️

### 6. Common Issues & Solutions

**Issue: App still shows "John Doe" after new login**
- **Cause**: App data not cleared properly
- **Solution**: Force refresh or restart app

**Issue: "No vehicles found" message**
- **Cause**: API call successful but no vehicles in database
- **Solution**: Add vehicle via admin panel at `http://localhost:8000/admin`

**Issue: Login succeeds but data doesn't load**
- **Cause**: Network timeout or API error
- **Solution**: Check backend logs and network connectivity

## 🧪 Quick Test Commands

```bash
# Test if backend is running
curl http://localhost:8000/health

# Test login with your code
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"client_code": "HQDMGD01"}'

# Full API test
./TEST_NEW_USER.sh
```

## 🎯 Expected Final Result

After fixes, when you login with `HQDMGD01`, you should see:

**Home Screen:**
- Header: "Welcome back, aboodhanini!"
- Vehicle: MG asd (2022) with license plate "123"
- Recent Activity: "No recent service history"

**Profile Screen:**
- Name: aboodhanini
- Phone: 0798192928
- Email: hdroid66@gmail.com

## 🚨 If All Else Fails

1. **Check Flutter version compatibility**
2. **Verify CORS settings in backend**
3. **Test with different device/simulator**
4. **Check network permissions in Flutter app**

## 📞 Next Steps

If you're still seeing demo data after following this guide:
1. Share the Flutter console output 
2. Show what you see on the home screen
3. Confirm which login code you're using
4. Verify backend test script works correctly