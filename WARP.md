# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

EvMaster Workshop Client Portal - A comprehensive mobile application and backend system for car workshop clients to view their vehicle service history and records. This is a production-ready system with admin-managed authentication where clients receive codes from the workshop to access their data.

**Tech Stack:**
- **Frontend**: Flutter mobile app with Provider state management
- **Backend**: FastAPI with SQLAlchemy ORM 
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: Admin-provided client codes + JWT tokens

## Quick Command Reference

```bash
# Start development (from project root)
cd backend && python main.py &              # Start FastAPI backend
cd client && flutter run                    # Start Flutter app

# Health checks
curl http://localhost:8000/health            # Test backend health
curl http://localhost:8000/docs             # View API documentation
curl http://localhost:8000/admin            # Access admin panel
flutter doctor                              # Check Flutter setup

# Clean rebuilds
cd backend && rm -rf venv && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
cd client && flutter clean && flutter pub get

# Test API endpoints
curl -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d '{"client_code":"DEMO123"}'

# Test with different client codes
curl -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d '{"client_code":"ABC123"}'
curl -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d '{"client_code":"XYZ789"}'
```

## Essential Commands

### Backend (FastAPI/Python)

```bash
# From backend directory
cd backend

# Setup virtual environment (first time)
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python main.py

# Run with auto-reload (using uvicorn directly)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Database migrations (when implemented)
alembic upgrade head
alembic revision --autogenerate -m "Migration message"

# Run tests
pytest
pytest -v                       # Verbose output
pytest backend/tests/           # Specific test directory
```

**Backend runs on**: `http://localhost:8000`
**API Documentation**: `http://localhost:8000/docs` (Swagger UI)
**Admin Panel**: `http://localhost:8000/admin` (Workshop Management)
**Entry point**: `backend/main.py`

### Frontend (Flutter)

```bash
# From client directory
cd client

# Install dependencies
flutter pub get

# Run app (auto-detects device)
flutter run

# Run on specific device
flutter devices                 # List available devices
flutter run -d <device-id>

# Run tests
flutter test
flutter test test/widget_test.dart

# Build for release
flutter build apk              # Android APK
flutter build appbundle        # Android App Bundle
flutter build ios              # iOS

# Code analysis and formatting
flutter analyze
dart format lib/
dart fix --apply                # Apply suggested fixes

# Debug and performance
flutter logs                    # Device logs
flutter run --profile           # Profile mode
```

**Flutter SDK**: 3.0+, **Dart SDK**: ^3.8.1

## Architecture

### System Design

The system follows a client-server architecture with admin-managed authentication:

**Authentication Flow:**
1. User opens app → AuthWrapper checks login status
2. If not authenticated → Login screen with client code input  
3. Client code sent to backend → JWT token returned
4. Token stored locally → User enters main app
5. All API requests use JWT Bearer token
6. Logout clears token → Returns to login screen

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│  Flutter App    │◄───────────────►│  FastAPI        │
│  (Client)       │  JSON/JWT       │  Backend        │
│  - Auth Service │                 │  - Auth System  │
│  - API Client   │                 │  - Mock Data    │
│  - Models       │                 │  - SQLAlchemy   │
└─────────────────┘                 └─────────────────┘
                                            │
                                            ▼
                                    ┌─────────────────┐
                                    │  PostgreSQL     │
                                    │  Database       │
                                    │  (Planned)      │
                                    └─────────────────┘
```

### Backend Architecture (FastAPI)

**Current Implementation:**
- FastAPI app with CORS middleware for Flutter integration
- Pydantic models for request/response validation
- JWT bearer token authentication (HTTPBearer)
- Complete database integration with SQLAlchemy ORM
- Real authentication with database-backed client codes
- Admin panel with full CRUD operations
- Structured error handling with HTTP status codes

**Key Components:**
- `main.py` - FastAPI app, routes, and mock endpoints
- `models.py` - SQLAlchemy database models (Client, Vehicle, ServiceRecord, etc.)
- JWT authentication flow with admin-provided client codes

**API Endpoints:**
- `GET /` - Root endpoint (API info)
- `GET /health` - Health check
- `GET /admin` - Admin panel web interface
- `POST /auth/login` - Client authentication with code
- `GET /client/profile` - Client information  
- `GET /client/cars` - Client's vehicles
- `GET /client/cars/{car_id}/history` - Vehicle service history

**Admin API Endpoints:**
- `GET /admin/dashboard` - Dashboard statistics
- `GET /admin/clients` - List all clients
- `POST /admin/clients` - Create new client
- `DELETE /admin/clients/{id}` - Deactivate client
- `GET /admin/vehicles` - List all vehicles
- `POST /admin/vehicles` - Create new vehicle
- `DELETE /admin/vehicles/{id}` - Delete vehicle
- `GET /admin/client-codes` - List all client codes
- `POST /admin/client-codes` - Create new client code
- `PUT /admin/client-codes/{id}/toggle` - Toggle code status
- `DELETE /admin/client-codes/{id}` - Delete client code
- `POST /admin/generate-code` - Generate random code

**Database Schema (SQLAlchemy Models):**
- `clients` - Client profiles and contact info
- `client_codes` - Admin-generated authentication codes
- `vehicles` - Vehicle records linked to clients
- `service_records` - Service history and costs
- `inspection_reports` - Vehicle inspection reports
- `inspection_items` - Individual inspection checklist items

### Frontend Architecture (Flutter)

**Current Implementation:**
- Standard Flutter app structure with planned custom UI
- Complete model classes for all business entities
- HTTP service layer with authentication handling
- Local storage via SharedPreferences for tokens
- Provider-ready for state management
- Asset directories configured for images/icons

**Key Components:**
- `lib/main.dart` - App entry point (currently default counter demo)
- `lib/models/workshop_models.dart` - Business models (Client, Vehicle, ServiceRecord, etc.)
- `lib/services/auth_service.dart` - Authentication and API client services

**Dependencies:**
- `provider: ^6.1.1` - State management
- `go_router: ^12.1.3` - Navigation
- `http: ^1.1.0` - API requests
- `shared_preferences: ^2.2.2` - Local storage
- `flutter_svg: ^2.0.9` - SVG assets
- `intl: ^0.18.1` - Date formatting

### Authentication Flow

1. **Admin provides client code** - Workshop generates unique code for customer
2. **Client enters code** - User inputs code in mobile app
3. **Backend validates code** - API checks code against database
4. **JWT token issued** - Backend returns access token
5. **Authenticated requests** - All API calls use Bearer token

### Development Status

**✅ Completed:**
- FastAPI backend structure with mock endpoints
- Complete SQLAlchemy database models
- Flutter app scaffold with dependencies
- HTTP service layer with authentication
- Business model classes for all entities
- API endpoint structure and documentation
- Database connection and initialization
- Admin panel web interface for workshop management
- RESTful admin API endpoints for CRUD operations
- Real authentication with database-backed client codes

**🚧 In Progress:**
- Custom Flutter UI implementation (currently default demo)
- State management integration (Provider configured)
- Client-side API integration with real endpoints

**📋 Planned:**
- Admin dashboard for code generation
- Real-time notifications
- Appointment scheduling
- Multi-language support

## Development Guidelines

### Backend Development

- **Entry Point**: `backend/main.py` contains FastAPI app and all routes
- **Database**: SQLAlchemy models in `models.py` ready for connection
- **Authentication**: JWT tokens with admin-provided client codes
- **API Standards**: RESTful endpoints with proper HTTP status codes
- **Documentation**: Automatic Swagger docs at `/docs`

### Flutter Development  

- **Entry Point**: `client/lib/main.dart` (needs custom UI implementation)
- **State Management**: Provider pattern (configured but not implemented)
- **API Integration**: `AuthService` and `WorkshopApiClient` classes handle all HTTP
- **Models**: Complete business models in `models/workshop_models.dart`
- **Navigation**: go_router configured for app routing
- **Local Storage**: SharedPreferences for token persistence

### Adding New Features

**Backend Routes:**
```python
@app.get("/new-endpoint")
async def new_endpoint(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Add JWT validation logic
    # Return response data
    pass
```

**Flutter API Calls:**
```dart
Future<List<dynamic>?> getNewData() async {
  final headers = await _authService.getAuthHeaders();
  final response = await http.get(
    Uri.parse('$_baseUrl/new-endpoint'),
    headers: headers,
  );
  // Handle response
}
```

## Admin Panel

The EvMaster Workshop includes a comprehensive web-based admin panel for workshop staff to manage the system.

### Access
**URL**: `http://localhost:8000/admin`
**Location**: `/backend/admin_panel/index.html`
**Documentation**: `/backend/admin_panel/README.md`

### Features

**📊 Dashboard**
- Real-time statistics (clients, vehicles, codes)
- Recent activity overview
- Auto-refresh every 30 seconds

**👥 Client Management**
- Create new client accounts
- View all clients with status indicators
- Deactivate clients (preserves data integrity)
- Contact information management

**🚗 Vehicle Management** 
- Add vehicles to client accounts
- Track vehicle details (make, model, year, VIN, etc.)
- Associate vehicles with owners
- Delete vehicle records

**🔑 Client Code Management**
- Generate authentication codes
- Custom or auto-generated codes
- Activate/deactivate codes
- Track code usage and assignment

**⚡ Quick Tools**
- Instant code generation
- Copy-to-clipboard functionality
- Bulk operations support

### Usage Examples

```bash
# Create a new client
curl -X POST http://localhost:8000/admin/clients \
  -H "Content-Type: application/json" \
  -d '{"name": "John Smith", "phone": "+1234567890"}'

# Generate a client code
curl -X POST http://localhost:8000/admin/client-codes \
  -H "Content-Type: application/json" \
  -d '{"client_id": 1, "code": "CUSTOM123"}'

# Get dashboard stats
curl http://localhost:8000/admin/dashboard
```

### Security Notes

- Admin panel has no authentication (development only)
- Production deployment should add authentication
- All admin operations are logged to console
- CORS is configured for development use

## Environment Configuration

### Backend Environment
- **Host**: `0.0.0.0` (configurable)
- **Port**: `8000` (default)
- **CORS**: Enabled for all origins (restrict in production)
- **Database**: SQLAlchemy with PostgreSQL/SQLite support

### Flutter Environment
- **API Base URL**: `http://localhost:8000` (hardcoded in AuthService)
- **Local Storage**: SharedPreferences for auth tokens
- **Asset Paths**: `assets/images/` and `assets/icons/` configured

## Testing Strategy

### Backend Testing
- **Framework**: pytest with async support
- **Coverage**: API endpoints, authentication, database operations
- **Run Tests**: `pytest` from backend directory

### Flutter Testing
- **Framework**: Built-in Flutter test framework  
- **Coverage**: Widget tests, model validation, service integration
- **Run Tests**: `flutter test` from client directory

## Troubleshooting Common Issues

### Backend Issues
- **Port 8000 in use**: Kill process with `lsof -ti:8000 | xargs kill -9`
- **Python dependencies**: Ensure virtual environment is activated
- **CORS errors**: Check backend is running when testing Flutter app
- **Import errors**: Verify all dependencies in requirements.txt are installed

### Flutter Issues  
- **Build failures**: Run `flutter clean && flutter pub get`
- **HTTP errors**: Ensure backend is running on localhost:8000
- **Token issues**: Check SharedPreferences or logout/login again
- **Device not detected**: Run `flutter devices` and ensure emulator is running

### Integration Issues
- **API not responding**: Verify backend URL in `AuthService._baseUrl`
- **Authentication failing**: Check client code format in login endpoint
- **Data not loading**: Ensure JWT token is properly stored and sent in headers

## Key Architecture Notes

- **Monorepo Structure**: Backend and client in separate directories
- **API-First Design**: Backend provides RESTful API, Flutter consumes it
- **Admin-Managed Auth**: Workshop controls client access via generated codes
- **Offline-Capable**: Local storage allows app to work with cached data
- **Scalable Models**: Database schema supports multiple clients and vehicles
- **Production-Ready**: FastAPI with proper error handling and documentation

## Next Development Priorities

1. **Database Integration** - Connect SQLAlchemy models to actual database
2. **Custom Flutter UI** - Replace demo app with workshop-themed interface  
3. **State Management** - Implement Provider pattern for app state
4. **Real Authentication** - Replace mock login with actual code validation
5. **Error Handling** - Add proper error states and user feedback
6. **Testing Suite** - Add comprehensive test coverage for both backend and frontend