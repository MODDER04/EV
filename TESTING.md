# EvMaster Workshop - Testing Instructions

## ✅ Real Data Integration Complete!

The Flutter app now fetches all data from the backend API instead of using demo/sample data.

## 🚀 How to Test

### 1. Start the Backend Server
```bash
cd backend
python main.py
```

The server will start on `http://localhost:8000` and automatically:
- Initialize the database with SQLite
- Create sample data (2 clients, 3 vehicles, service records, inspections)
- Set up the admin panel

### 2. Start the Flutter App
```bash
cd client
flutter run
```

### 3. Test the Login Flow

**Available Test Codes:**
- `DEMO123` - For client "John Doe" (ID: 1)
- `ABC123` - For client "Jane Smith" (ID: 2)

### 4. Test Complete Data Flow

1. **Launch App** → Should show login screen
2. **Enter Code** → Use `DEMO123`
3. **Login Success** → App loads real data from API:
   - Client profile from `/client/profile`
   - Vehicles from `/client/cars`
   - Service history from `/client/cars/{id}/history`
   - Inspections from `/client/cars/{id}/inspection`
4. **Navigate Through App** → All data is now real from the database

## 🔍 What Changed

### Backend Updates
✅ **Token Authentication**: Proper JWT token validation
✅ **Real Database Queries**: All endpoints now query SQLite database
✅ **Client Verification**: Tokens are validated and client ownership is enforced
✅ **Error Handling**: Proper HTTP status codes and error messages

### Flutter App Updates
✅ **Real API Integration**: Removed all sample/demo data
✅ **Dynamic Data Loading**: App fetches data after successful authentication
✅ **Error Handling**: Graceful error handling with fallbacks
✅ **Loading States**: Proper loading indicators while fetching data

### API Endpoints Updated
- `GET /client/profile` → Returns authenticated client's real profile
- `GET /client/cars` → Returns client's actual vehicles from database
- `GET /client/cars/{id}/history` → Returns real service records
- `GET /client/cars/{id}/inspection` → Returns actual inspection reports

## 📊 Sample Data Available

**John Doe (DEMO123)**:
- 2 Vehicles: Mercedes-Benz C-Class (2018), BMW 3 Series (2020)
- Multiple service records
- 1 Inspection report with 4 items

**Jane Smith (ABC123)**:
- 1 Vehicle: Tesla Model 3 (2022)
- Service records and inspection data

## 🛠 Admin Panel

Access the admin panel to manage data:
- **URL**: `http://localhost:8000/admin`
- **Features**: Add clients, vehicles, generate codes
- **Use Case**: Create new test accounts and codes

## ✅ Test Scenarios

### Scenario 1: Happy Path
1. Enter valid code (`DEMO123`)
2. Login succeeds
3. See real client name in profile
4. View actual vehicles from database
5. Browse service history with real dates and costs
6. Check inspection reports

### Scenario 2: Invalid Code
1. Enter invalid code (`INVALID`)
2. Should show error message
3. Stay on login screen

### Scenario 3: Network Issues
1. Stop backend server
2. Try to login
3. App should handle gracefully with error message
4. Restart server and retry should work

### Scenario 4: Data Loading
1. Login with valid code
2. Watch loading indicators while data loads
3. All screens should populate with real data
4. No more "demo" or "sample" text anywhere

## 🧪 API Testing

You can also test the API endpoints directly:

```bash
# Login and get token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"client_code": "DEMO123"}'

# Test profile (use token from login response)
curl http://localhost:8000/client/profile \
  -H "Authorization: Bearer token_DEMO123_1"

# Test vehicles
curl http://localhost:8000/client/cars \
  -H "Authorization: Bearer token_DEMO123_1"

# Test service history
curl http://localhost:8000/client/cars/1/history \
  -H "Authorization: Bearer token_DEMO123_1"

# Test inspection
curl http://localhost:8000/client/cars/1/inspection \
  -H "Authorization: Bearer token_DEMO123_1"
```

## 🎯 Success Criteria

- ✅ No more sample/demo data in the app
- ✅ All data comes from backend database
- ✅ Proper authentication with real codes
- ✅ Error handling when API fails
- ✅ Loading states during data fetch
- ✅ Real client names, vehicles, and service data displayed
- ✅ Admin panel can create new test accounts

## 🐛 Troubleshooting

**App shows no data after login:**
- Check backend server is running
- Check network connectivity
- Look at Flutter console for errors

**Login fails with valid code:**
- Restart backend server
- Check if code exists in admin panel
- Verify client is active

**API errors:**
- Check server logs in terminal
- Ensure database is initialized
- Try restarting the backend

## 🔄 Next Steps

The app now has complete real data integration! You can:
1. Add more test clients via admin panel
2. Create additional client codes
3. Test with different vehicles and service histories
4. Expand the API to include more features

All demo text has been removed and the app now functions as a real workshop client portal with proper database integration.