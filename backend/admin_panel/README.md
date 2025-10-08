# EvMaster Workshop Admin Panel

A comprehensive web-based admin interface for managing the EvMaster Workshop client portal system.

## Features

### 📊 Dashboard
- **Real-time Statistics**: Live view of total clients, vehicles, active codes, and active clients
- **Recent Activity**: See the most recently added clients and vehicles
- **Auto-refresh**: Dashboard updates every 30 seconds automatically

### 👥 Client Management
- **Add Clients**: Create new client records with contact information
- **View All Clients**: List all clients with their status (Active/Inactive)
- **Deactivate Clients**: Safely deactivate client accounts
- **Real-time Updates**: Changes reflect immediately across the system

### 🚗 Vehicle Management
- **Add Vehicles**: Assign vehicles to existing clients
- **Vehicle Details**: Track make, model, year, license plate, VIN, and color
- **Client Association**: Vehicles are linked to their owners
- **Delete Vehicles**: Remove vehicle records when needed

### 🔑 Client Code Management
- **Generate Codes**: Create authentication codes for client access
- **Custom Codes**: Generate specific codes or auto-generate random ones
- **Code Status**: Activate/deactivate codes as needed
- **Usage Tracking**: See when codes were created and last used
- **Client Assignment**: Associate codes with specific clients

### ⚡ Quick Code Generator
- **Instant Generation**: Create unique codes with one click
- **8-Character Codes**: Secure, easy-to-read alphanumeric codes
- **Copy to Clipboard**: Quick copying for easy sharing
- **Ready to Use**: Generated codes can be immediately assigned

## Getting Started

### 1. Start the Backend Server

```bash
cd backend
python main.py
```

The server will start on `http://localhost:8000`

### 2. Access the Admin Panel

Open your web browser and navigate to:
```
http://localhost:8000/admin
```

### 3. Using the Interface

1. **Dashboard**: View system overview and statistics
2. **Clients**: Add, view, and manage client accounts
3. **Vehicles**: Assign and manage vehicles for clients
4. **Client Codes**: Generate and manage authentication codes
5. **Code Generator**: Quick tool for generating new codes

## API Endpoints

The admin panel uses the following REST API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Get dashboard statistics |
| GET | `/admin/clients` | List all clients |
| POST | `/admin/clients` | Create new client |
| DELETE | `/admin/clients/{id}` | Deactivate client |
| GET | `/admin/vehicles` | List all vehicles |
| POST | `/admin/vehicles` | Create new vehicle |
| DELETE | `/admin/vehicles/{id}` | Delete vehicle |
| GET | `/admin/client-codes` | List all client codes |
| POST | `/admin/client-codes` | Create new client code |
| PUT | `/admin/client-codes/{id}/toggle` | Toggle code status |
| DELETE | `/admin/client-codes/{id}` | Delete client code |
| POST | `/admin/generate-code` | Generate random code |

## Features in Detail

### Dashboard Statistics
- **Total Clients**: All clients in the system
- **Active Clients**: Clients with active status
- **Total Vehicles**: All registered vehicles
- **Active Codes**: Currently valid authentication codes

### Client Operations
1. **Adding Clients**:
   - Name and phone number are required
   - Email and address are optional
   - All clients are created as active by default

2. **Managing Clients**:
   - Deactivate instead of delete to preserve data integrity
   - Inactive clients cannot log in but data is preserved

### Vehicle Operations
1. **Adding Vehicles**:
   - Must be assigned to an existing active client
   - Make, model, year, and license plate are required
   - VIN and color are optional

2. **Vehicle Data**:
   - Vehicles are always linked to their owner
   - Support for all vehicle types and makes

### Code Management
1. **Code Generation**:
   - Auto-generated codes are 8 characters long
   - Use uppercase letters and numbers for clarity
   - Custom codes can be specified if needed

2. **Code Assignment**:
   - Codes must be assigned to specific clients
   - Multiple codes per client are supported
   - Codes can be activated/deactivated as needed

## Technical Details

### Architecture
- **Frontend**: Pure HTML5, CSS3, and vanilla JavaScript
- **Backend API**: FastAPI with SQLAlchemy ORM
- **Database**: SQLite (development) / PostgreSQL (production)
- **Real-time Updates**: AJAX calls with automatic refresh

### Browser Compatibility
- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Security Considerations
- Admin panel should be secured in production
- Consider adding authentication for admin access
- Database connections should use secure credentials
- HTTPS recommended for production deployment

## Troubleshooting

### Common Issues

1. **Admin panel not loading**:
   - Ensure backend server is running
   - Check that `admin_panel/index.html` exists
   - Verify port 8000 is not blocked

2. **API calls failing**:
   - Check browser console for errors
   - Ensure CORS is properly configured
   - Verify database connection

3. **Data not updating**:
   - Hard refresh the browser (Ctrl+F5)
   - Check network tab for failed requests
   - Verify database write permissions

### Development

To modify the admin panel:

1. Edit `admin_panel/index.html` for interface changes
2. Modify `admin_routes.py` for API changes
3. Update database models in `models.py` if needed
4. Restart the backend server to apply changes

## Production Deployment

For production use:

1. Add authentication to admin routes
2. Use HTTPS for secure connections  
3. Configure proper CORS origins
4. Use PostgreSQL instead of SQLite
5. Set up proper logging and monitoring
6. Consider using a reverse proxy (nginx)

## Support

For issues or questions:
- Check the main project documentation
- Review API endpoints at `http://localhost:8000/docs`
- Examine browser developer tools for client-side issues
- Check server logs for backend problems