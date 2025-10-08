# 🔧 Connection Troubleshooting Guide

## ❌ Problem: "Connection refused" Error

If you're seeing this error in the Flutter app:
```
Login error: ClientException with SocketException: Connection refused (OS Error: Connection refused, errno = 111), address = localhost, port = 8000
```

This means the Flutter app cannot connect to the backend server. Here are the solutions:

## ✅ Solutions

### 1. **Make Sure Backend is Running**

**Start the backend server:**
```bash
cd /Users/modder/evmaster-workshop/backend
source venv/bin/activate
python main.py
```

**Verify it's running:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### 2. **Platform-Specific URLs**

The app now automatically detects your platform and uses the correct URL:

| Platform | URL Used |
|----------|----------|
| Android Emulator | `http://10.0.2.2:8000` |
| iOS Simulator | `http://localhost:8000` |
| Physical Device | Need your computer's IP |

### 3. **For Physical Devices**

If testing on a real phone/tablet, you need your computer's IP address:

**Find your computer's IP:**
```bash
# On macOS/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1

# On Windows:
ipconfig | findstr "IPv4"
```

**Update the config:**
Edit `/Users/modder/evmaster-workshop/client/lib/config/api_config.dart` and replace `YOUR_COMPUTER_IP` with your actual IP address.

### 4. **Alternative: Use Your IP Address**

If the automatic detection doesn't work, manually set your computer's IP:

1. Find your IP address (e.g., `192.168.1.100`)
2. Edit `lib/config/api_config.dart`:
```dart
static String get baseUrl {
  if (kDebugMode) {
    return 'http://192.168.1.100:8000'; // Use your IP
  } else {
    return 'https://your-api-domain.com';
  }
}
```

### 5. **Check Firewall Settings**

Make sure your firewall allows connections on port 8000:

**macOS:**
```bash
sudo pfctl -f /etc/pf.conf
```

**Check if port is blocked:**
```bash
netstat -an | grep 8000
```

### 6. **Alternative Port**

If port 8000 is blocked, use a different port:

**Backend (main.py):**
```python
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)  # Use port 8080
```

**Flutter (api_config.dart):**
```dart
return 'http://10.0.2.2:8080';  // Update port
```

## 🔍 Debugging Steps

### 1. **Check Backend Status**
```bash
curl http://localhost:8000/health
curl http://localhost:8000/docs  # API documentation
```

### 2. **Test Login Endpoint**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"client_code":"DEMO123"}'
```

### 3. **Check Current Configuration**
The login screen now shows debug info:
- Current API URL being used
- Platform (Android/iOS)
- Suggested demo codes

### 4. **Network Connectivity**
Make sure your device/emulator has internet access:
```bash
# From device/emulator, try:
ping google.com
```

## 🚀 Quick Fix Commands

**Option 1: Restart Everything**
```bash
# Terminal 1: Backend
cd backend && source venv/bin/activate && python main.py

# Terminal 2: Flutter  
cd client && flutter clean && flutter run
```

**Option 2: Use Different Device**
```bash
# List available devices
flutter devices

# Run on specific device
flutter run -d <device-id>
```

**Option 3: Test API Manually**
```bash
# Test backend is working
curl http://localhost:8000/health

# Test login endpoint
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"client_code":"TEST123"}'
```

## ✅ Success Indicators

You'll know it's working when:
1. ✅ `curl http://localhost:8000/health` returns `{"status":"healthy"}`
2. ✅ Login screen shows correct API URL in debug info
3. ✅ No "Connection refused" errors in Flutter logs
4. ✅ Login with "DEMO123" successfully enters the app

## 📱 Platform Notes

### Android Emulator
- ✅ Uses `http://10.0.2.2:8000` automatically
- ✅ Should work out of the box

### iOS Simulator  
- ✅ Uses `http://localhost:8000` automatically
- ✅ Should work out of the box

### Physical Devices
- ⚠️ Requires your computer's IP address
- ⚠️ Device and computer must be on same WiFi network
- ⚠️ Firewall must allow connections on port 8000

## 🆘 Still Having Issues?

1. **Check the Flutter logs** for specific error messages
2. **Verify backend logs** show incoming requests  
3. **Try different devices** (emulator vs physical)
4. **Check network connectivity** between device and computer
5. **Restart both backend and Flutter app**

The connection should work seamlessly once the backend is running and the correct URL is configured! 🚗✨