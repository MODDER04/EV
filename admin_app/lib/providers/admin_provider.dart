import 'package:flutter/foundation.dart';
import '../services/admin_api_service.dart';

class AdminProvider extends ChangeNotifier {
  final AdminApiService _apiService;
  
  AdminProvider(this._apiService) {
    _loadInitialData();
  }

  // Dashboard Stats
  Map<String, dynamic>? _dashboardStats;
  Map<String, dynamic>? get dashboardStats => _dashboardStats;

  // Clients
  List<dynamic> _clients = [];
  List<dynamic> get clients => _clients;

  // Vehicles
  List<dynamic> _vehicles = [];
  List<dynamic> get vehicles => _vehicles;

  // Client Codes
  List<dynamic> _clientCodes = [];
  List<dynamic> get clientCodes => _clientCodes;

  // Inspections
  List<dynamic> _inspections = [];
  List<dynamic> get inspections => _inspections;

  // Service Records
  List<dynamic> _serviceRecords = [];
  List<dynamic> get serviceRecords => _serviceRecords;

  // Loading states
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  bool _isDashboardLoading = true;
  bool get isDashboardLoading => _isDashboardLoading;

  bool _isClientsLoading = true;
  bool get isClientsLoading => _isClientsLoading;

  bool _isVehiclesLoading = true;
  bool get isVehiclesLoading => _isVehiclesLoading;

  bool _isClientCodesLoading = true;
  bool get isClientCodesLoading => _isClientCodesLoading;

  bool _isInspectionsLoading = true;
  bool get isInspectionsLoading => _isInspectionsLoading;

  bool _isServiceRecordsLoading = true;
  bool get isServiceRecordsLoading => _isServiceRecordsLoading;

  // Error states
  String? _error;
  String? get error => _error;

  // Server health
  bool _isServerHealthy = false;
  bool get isServerHealthy => _isServerHealthy;

  // Initialize data
  Future<void> _loadInitialData() async {
    await checkServerHealth();
    if (_isServerHealthy) {
      await Future.wait([
        loadDashboardStats(),
        loadClients(),
        loadVehicles(),
        loadClientCodes(),
        loadInspections(),
        loadServiceRecords(),
      ]);
    }
  }

  // Check server health
  Future<void> checkServerHealth() async {
    try {
      _isServerHealthy = await _apiService.checkServerHealth();
      if (!_isServerHealthy) {
        _error = 'Backend server is not responding. Please start the server.';
      } else {
        _error = null;
      }
    } catch (e) {
      _isServerHealthy = false;
      _error = 'Cannot connect to backend server: $e';
    }
    notifyListeners();
  }

  // Dashboard Stats
  Future<void> loadDashboardStats() async {
    _isDashboardLoading = true;
    notifyListeners();
    
    try {
      _dashboardStats = await _apiService.getDashboardStats();
      _error = null;
    } catch (e) {
      _error = 'Failed to load dashboard stats: $e';
      print('Dashboard stats error: $e');
    } finally {
      _isDashboardLoading = false;
      notifyListeners();
    }
  }

  // Clients Management
  Future<void> loadClients() async {
    _isClientsLoading = true;
    notifyListeners();
    
    try {
      final result = await _apiService.getClients();
      _clients = result ?? [];
      _error = null;
    } catch (e) {
      _error = 'Failed to load clients: $e';
      print('Clients loading error: $e');
    } finally {
      _isClientsLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createClient(Map<String, dynamic> clientData) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final result = await _apiService.createClient(clientData);
      if (result != null) {
        await loadClients(); // Refresh the list
        _error = null;
        return true;
      }
      return false;
    } catch (e) {
      _error = 'Failed to create client: $e';
      print('Client creation error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> deleteClient(String clientId) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final success = await _apiService.deleteClient(clientId);
      if (success) {
        await loadClients(); // Refresh the list
        _error = null;
      }
      return success;
    } catch (e) {
      _error = 'Failed to delete client: $e';
      print('Client deletion error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Vehicles Management
  Future<void> loadVehicles() async {
    _isVehiclesLoading = true;
    notifyListeners();
    
    try {
      final result = await _apiService.getVehicles();
      _vehicles = result ?? [];
      _error = null;
    } catch (e) {
      _error = 'Failed to load vehicles: $e';
      print('Vehicles loading error: $e');
    } finally {
      _isVehiclesLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createVehicle(Map<String, dynamic> vehicleData) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final result = await _apiService.createVehicle(vehicleData);
      if (result != null) {
        await loadVehicles(); // Refresh the list
        _error = null;
        return true;
      }
      return false;
    } catch (e) {
      _error = 'Failed to create vehicle: $e';
      print('Vehicle creation error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> deleteVehicle(String vehicleId) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final success = await _apiService.deleteVehicle(vehicleId);
      if (success) {
        await loadVehicles(); // Refresh the list
        _error = null;
      }
      return success;
    } catch (e) {
      _error = 'Failed to delete vehicle: $e';
      print('Vehicle deletion error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Client Codes Management
  Future<void> loadClientCodes() async {
    _isClientCodesLoading = true;
    notifyListeners();
    
    try {
      final result = await _apiService.getClientCodes();
      _clientCodes = result ?? [];
      _error = null;
    } catch (e) {
      _error = 'Failed to load client codes: $e';
      print('Client codes loading error: $e');
    } finally {
      _isClientCodesLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createClientCode(Map<String, dynamic> codeData) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final result = await _apiService.createClientCode(codeData);
      if (result != null) {
        await loadClientCodes(); // Refresh the list
        _error = null;
        return true;
      }
      return false;
    } catch (e) {
      _error = 'Failed to create client code: $e';
      print('Client code creation error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<String?> generateClientCode() async {
    try {
      final code = await _apiService.generateCode();
      if (code != null) {
        await loadClientCodes(); // Refresh the list after generating
      }
      return code;
    } catch (e) {
      _error = 'Failed to generate code: $e';
      print('Code generation error: $e');
      notifyListeners();
      return null;
    }
  }

  Future<bool> toggleClientCode(String codeId) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final success = await _apiService.toggleClientCode(codeId);
      if (success) {
        await loadClientCodes(); // Refresh the list
        _error = null;
      }
      return success;
    } catch (e) {
      _error = 'Failed to toggle client code: $e';
      print('Client code toggle error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> deleteClientCode(String codeId) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final success = await _apiService.deleteClientCode(codeId);
      if (success) {
        await loadClientCodes(); // Refresh the list
        _error = null;
      }
      return success;
    } catch (e) {
      _error = 'Failed to delete client code: $e';
      print('Client code deletion error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Inspections Management
  Future<void> loadInspections() async {
    _isInspectionsLoading = true;
    notifyListeners();
    
    try {
      final result = await _apiService.getInspections();
      _inspections = result ?? [];
      _error = null;
    } catch (e) {
      _error = 'Failed to load inspections: $e';
      print('Inspections loading error: $e');
    } finally {
      _isInspectionsLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createInspection(Map<String, dynamic> inspectionData) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final result = await _apiService.createInspection(inspectionData);
      if (result != null) {
        await loadInspections(); // Refresh the list
        _error = null;
        return true;
      }
      return false;
    } catch (e) {
      _error = 'Failed to create inspection: $e';
      print('Inspection creation error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> deleteInspection(String inspectionId) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final success = await _apiService.deleteInspection(inspectionId);
      if (success) {
        await loadInspections(); // Refresh the list
        _error = null;
      }
      return success;
    } catch (e) {
      _error = 'Failed to delete inspection: $e';
      print('Inspection deletion error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Service Records Management
  Future<void> loadServiceRecords() async {
    _isServiceRecordsLoading = true;
    notifyListeners();
    
    try {
      final result = await _apiService.getServiceRecords();
      _serviceRecords = result ?? [];
      _error = null;
    } catch (e) {
      _error = 'Failed to load service records: $e';
      print('Service records loading error: $e');
    } finally {
      _isServiceRecordsLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createServiceRecord(Map<String, dynamic> serviceData) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final result = await _apiService.createServiceRecord(serviceData);
      if (result != null) {
        await loadServiceRecords(); // Refresh the list
        _error = null;
        return true;
      }
      return false;
    } catch (e) {
      _error = 'Failed to create service record: $e';
      print('Service record creation error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> deleteServiceRecord(String serviceId) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final success = await _apiService.deleteServiceRecord(serviceId);
      if (success) {
        await loadServiceRecords(); // Refresh the list
        _error = null;
      }
      return success;
    } catch (e) {
      _error = 'Failed to delete service record: $e';
      print('Service record deletion error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Refresh all data
  Future<void> refreshData() async {
    _error = null;
    notifyListeners();
    
    await checkServerHealth();
    if (_isServerHealthy) {
      await Future.wait([
        loadDashboardStats(),
        loadClients(),
        loadVehicles(),
        loadClientCodes(),
        loadInspections(),
        loadServiceRecords(),
      ]);
    }
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}