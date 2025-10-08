#!/bin/bash

# EvMaster Workshop - Development Setup Script

echo "🚗 EvMaster Workshop - Starting Development Environment"
echo "=================================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

if ! command_exists flutter; then
    echo "❌ Flutter is not installed. Please install Flutter SDK first."
    exit 1
fi

echo "✅ Prerequisites check passed!"
echo ""

# Setup backend
echo "🔧 Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Start backend server in background
echo "🚀 Starting FastAPI backend server..."
python main.py &
BACKEND_PID=$!
echo "Backend server started with PID: $BACKEND_PID"

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 5

# Test backend health
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is running successfully!"
    echo "📶 API Documentation: http://localhost:8000/docs"
    echo "📱 Android Emulator: http://10.0.2.2:8000"
    echo "🍎 iOS Simulator: http://localhost:8000"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

cd ..

# Setup Flutter app
echo ""
echo "🔧 Setting up Flutter app..."
cd client

echo "Getting Flutter dependencies..."
flutter pub get

echo "Running Flutter doctor..."
flutter doctor

echo ""
echo "🎉 Setup complete! You can now:"
echo ""
echo "Backend:"
echo "  • API Health: curl http://localhost:8000/health"
echo "  • API Docs: open http://localhost:8000/docs"
echo "  • Stop backend: kill $BACKEND_PID"
echo ""
echo "Frontend:"
echo "  • Run Flutter app: flutter run"
echo "  • Run on specific device: flutter run -d <device-id>"
echo "  • List devices: flutter devices"
echo ""
echo "🔥 Happy coding!"

# Keep script running so backend stays active
echo "Press Ctrl+C to stop the backend server..."
trap "echo 'Stopping backend...'; kill $BACKEND_PID 2>/dev/null; exit 0" INT
wait