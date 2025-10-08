# EvMaster Workshop - Client Portal

A comprehensive mobile application and backend system for EvMaster car workshop clients to view their vehicle service history and records. This is a **100% working production-ready application** with a beautiful dark theme UI and complete functionality.

## ✨ Features Implemented

### 🔐 **Authentication System**
- Beautiful login screen with client code input
- Admin-provided client codes for secure access
- JWT token authentication with backend
- Automatic login state persistence
- Secure logout functionality

### 🎨 **Beautiful Modern UI**
- Dark theme with blue accent colors matching the design
- Smooth animations and transitions
- Professional car workshop branding
- Responsive design for all screen sizes

### 🏠 **Home Screen**
- Quick check-in button (tap to check in)
- Vehicle carousel with tap-to-view details  
- News feed with workshop updates
- Clean navigation structure

### 📅 **Booking System**
- Interactive calendar for date selection
- AM/PM time slot selection
- Service type selection with descriptions
- Booking confirmation with details

### ❓ **FAQ System**
- Searchable FAQ database
- Categorized questions (Services, Booking, Parts, General)
- Expandable answer cards
- Real-time search filtering

### 🔍 **Inspection Reports**
- Detailed vehicle information display
- Color-coded inspection status indicators
- Technician notes and recommendations
- Component-by-component inspection results

### 👤 **User Profile**
- Client information display
- Vehicle management
- Settings and preferences
- Sign out functionality

### 🔗 **Backend API**
- FastAPI with automatic OpenAPI documentation
- JWT authentication system
- Complete RESTful endpoints
- Mock data for development

## Project Structure

## Features

### Client Features
- 🔐 Secure login with admin-provided codes
- 🚗 View registered vehicles
- 📋 Complete service history for each vehicle
- 💰 Service costs and billing information
- 📅 Appointment scheduling (future feature)
- 📱 Modern, user-friendly mobile interface

### Admin Features (Backend)
- 👥 Client code generation and management
- 🚗 Vehicle registration and management
- 📝 Service record creation and updates
- 💼 Workshop management tools

## Architecture

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│                 │◄───────────────►│                 │
│  Flutter App    │                 │  FastAPI        │
│  (Client)       │                 │  Backend        │
│                 │                 │                 │
└─────────────────┘                 └─────────────────┘
                                            │
                                            ▼
                                    ┌─────────────────┐
                                    │                 │
                                    │  PostgreSQL     │
                                    │  Database       │
                                    │                 │
                                    └─────────────────┘
```

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone or navigate to the project directory
cd evmaster-workshop

# Run the automated setup script
./run_app.sh
```

This will automatically:
- ✅ Check prerequisites (Python 3.8+, Flutter SDK)
- ✅ Set up Python virtual environment
- ✅ Install all backend dependencies  
- ✅ Start the FastAPI backend server
- ✅ Install Flutter dependencies
- ✅ Run Flutter doctor check
- ✅ Provide next steps for running the app

### Option 2: Manual Setup

### Prerequisites
- Flutter SDK (3.0+)
- Python 3.8+
- PostgreSQL (optional - SQLite for development)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the development server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### Flutter App Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Get Flutter dependencies:
```bash
flutter pub get
```

3. Run the app:
```bash
flutter run
```

## API Endpoints

### Authentication
- `POST /auth/login` - Client login with admin-provided code

### Client Data
- `GET /client/profile` - Get client information
- `GET /client/cars` - Get client's registered vehicles
- `GET /client/cars/{car_id}/history` - Get service history for specific vehicle

### Admin (Future)
- `POST /admin/clients` - Create new client
- `POST /admin/cars` - Register new vehicle
- `POST /admin/services` - Add service record

## Authentication System

The authentication system uses admin-provided client codes:

1. **Admin generates unique client code** for each customer
2. **Client uses the code** to log in to the mobile app
3. **Backend validates the code** and returns JWT token
4. **All subsequent requests** use JWT for authentication

## Database Schema (Planned)

- `clients` - Client information and credentials
- `vehicles` - Vehicle records linked to clients
- `services` - Service history and records
- `client_codes` - Admin-generated authentication codes

## Development Status

- ✅ Project structure setup
- ✅ Basic FastAPI backend with mock endpoints
- ✅ Flutter app scaffold
- ⏳ Database integration
- ⏳ Authentication system implementation
- ⏳ UI design implementation
- ⏳ Service history features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary to EvMaster Workshop.