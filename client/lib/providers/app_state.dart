import 'package:flutter/material.dart';
import '../models/workshop_models.dart';
import '../services/auth_service.dart';

class AppState extends ChangeNotifier {
  int _currentIndex = 0;
  List<Vehicle> _vehicles = [];
  Client? _currentClient;
  List<ServiceRecord> _serviceHistory = [];
  List<InspectionReport> _inspections = [];
  DateTime? _selectedBookingDate;
  String? _selectedBookingTime;
  String? _selectedService;
  bool _isLoading = false;
  String? _errorMessage;

  // Getters
  int get currentIndex => _currentIndex;
  List<Vehicle> get vehicles => _vehicles;
  Client? get currentClient => _currentClient;
  List<ServiceRecord> get serviceHistory => _serviceHistory;
  List<InspectionReport> get inspections => _inspections;
  DateTime? get selectedBookingDate => _selectedBookingDate;
  String? get selectedBookingTime => _selectedBookingTime;
  String? get selectedService => _selectedService;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Navigation
  void setCurrentIndex(int index) {
    _currentIndex = index;
    notifyListeners();
  }

  // Client data
  void setCurrentClient(Client client) {
    _currentClient = client;
    notifyListeners();
  }

  void setVehicles(List<Vehicle> vehicles) {
    _vehicles = vehicles;
    notifyListeners();
  }

  void setServiceHistory(List<ServiceRecord> history) {
    _serviceHistory = history;
    notifyListeners();
  }

  void setInspections(List<InspectionReport> inspections) {
    _inspections = inspections;
    notifyListeners();
  }

  // Booking state
  void setSelectedBookingDate(DateTime? date) {
    _selectedBookingDate = date;
    notifyListeners();
  }

  void setSelectedBookingTime(String? time) {
    _selectedBookingTime = time;
    notifyListeners();
  }

  void setSelectedService(String? service) {
    _selectedService = service;
    notifyListeners();
  }

  void clearBooking() {
    _selectedBookingDate = null;
    _selectedBookingTime = null;
    _selectedService = null;
    notifyListeners();
  }

  // Loading state
  void setLoading(bool loading) {
    _isLoading = loading;
    if (loading) {
      _errorMessage = null; // Clear errors when starting to load
    }
    notifyListeners();
  }

  // Error state
  void setError(String? error) {
    _errorMessage = error;
    _isLoading = false;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Retry loading data
  Future<void> retryLoadData() async {
    clearError();
    await loadRealData();
  }

  // Load real data from API
  Future<void> loadRealData() async {
    print('🔄 Starting loadRealData...');
    setLoading(true);
    
    try {
      final apiClient = WorkshopApiClient();
      
      // Load client profile
      print('📞 Calling getClientProfile...');
      final profileData = await apiClient.getClientProfile();
      print('📋 Profile data received: $profileData');
      if (profileData != null) {
        _currentClient = Client(
          clientId: profileData['client_id'],
          name: profileData['name'],
          phone: profileData['phone'],
          email: profileData['email'],
        );
        print('✅ Client set: ${_currentClient?.name}');
      } else {
        print('❌ Profile data is null');
      }
      
      // Load vehicles
      print('🚗 Calling getClientCars...');
      final vehiclesData = await apiClient.getClientCars();
      print('🚗 Vehicles data received: $vehiclesData');
      if (vehiclesData != null) {
        _vehicles = vehiclesData.map((vehicleJson) => Vehicle(
          carId: vehicleJson['car_id'],
          make: vehicleJson['make'],
          model: vehicleJson['model'],
          year: vehicleJson['year'],
          licensePlate: vehicleJson['license_plate'],
          vin: vehicleJson['vin'],
          color: vehicleJson['color'],
        )).toList();
        print('✅ Vehicles loaded: ${_vehicles.length} vehicles');
        for (var vehicle in _vehicles) {
          print('  - ${vehicle.make} ${vehicle.model} (${vehicle.year})');
        }
      } else {
        print('❌ Vehicles data is null');
        _vehicles = [];
      }
      
      // Load service history for all cars
      final serviceData = await apiClient.getAllServiceHistory();
      if (serviceData != null) {
        _serviceHistory = serviceData.map((serviceJson) => ServiceRecord(
          serviceId: serviceJson['service_id'],
          carId: serviceJson['car_id'],
          date: DateTime.parse(serviceJson['date']),
          serviceType: serviceJson['service_type'],
          description: serviceJson['description'],
          cost: serviceJson['cost'].toDouble(),
          status: serviceJson['status'],
          technicianNotes: serviceJson['technician_notes'],
        )).toList();
      }
      
      // Load inspections for all cars
      final inspectionsData = await apiClient.getAllInspections();
      if (inspectionsData != null) {
        _inspections = inspectionsData.map((inspectionJson) => InspectionReport(
          inspectionId: inspectionJson['inspection_id'],
          carId: inspectionJson['car_id'],
          inspectionDate: DateTime.parse(inspectionJson['inspection_date']),
          overallCondition: inspectionJson['overall_condition'],
          technicianNotes: inspectionJson['technician_notes'],
          recommendations: inspectionJson['recommendations'],
          items: (inspectionJson['items'] as List).map((itemJson) => InspectionItem(
            itemName: itemJson['item_name'],
            status: itemJson['status'],
            notes: itemJson['notes'],
          )).toList(),
        )).toList();
      }
      
    } catch (e) {
      print('Error loading real data: $e');
      setError('Failed to load data from server: $e\n\nPlease check your connection and try again.');
      
      // Clear any existing data instead of falling back to sample data
      _currentClient = null;
      _vehicles = [];
      _serviceHistory = [];
      _inspections = [];
    } finally {
      setLoading(false);
      notifyListeners();
    }
  }

  // Clear all data (for logout)
  void clearData() {
    print('🧽 Clearing all app data...');
    _currentClient = null;
    _vehicles = [];
    _serviceHistory = [];
    _inspections = [];
    _selectedBookingDate = null;
    _selectedBookingTime = null;
    _selectedService = null;
    _errorMessage = null;
    _isLoading = false;
    notifyListeners();
  }
  
  // Force refresh data (clears everything first)
  Future<void> forceRefreshData() async {
    print('🔄 Force refreshing data - clearing first...');
    clearData();
    await loadRealData();
  }
}