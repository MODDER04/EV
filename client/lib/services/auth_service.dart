import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class AuthService {
  static const String _tokenKey = 'auth_token';
  static const String _clientIdKey = 'client_id';
  
  String get _baseUrl => ApiConfig.baseUrl;

  // Login with admin-provided client code
  Future<Map<String, dynamic>?> login(String clientCode) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/login'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'client_code': clientCode,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        // Store token and client info
        await _storeAuthData(data['access_token'], data['client_id']);
        
        return data;
      } else {
        return null;
      }
    } catch (e) {
      print('Login error: $e');
      return null;
    }
  }

  // Store authentication data
  Future<void> _storeAuthData(String token, String clientId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_clientIdKey, clientId);
  }

  // Get stored token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  // Get stored client ID
  Future<String?> getClientId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_clientIdKey);
  }

  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // Logout
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_clientIdKey);
  }

  // Get auth headers for API requests
  Future<Map<String, String>> getAuthHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }
}

// API Client for workshop data
class WorkshopApiClient {
  final AuthService _authService = AuthService();
  
  String get _baseUrl => ApiConfig.baseUrl;

  // Get client profile
  Future<Map<String, dynamic>?> getClientProfile() async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await http.get(
        Uri.parse('$_baseUrl/client/profile'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return null;
    } catch (e) {
      print('Profile fetch error: $e');
      return null;
    }
  }

  // Get client's cars
  Future<List<dynamic>?> getClientCars() async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await http.get(
        Uri.parse('$_baseUrl/client/cars'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return null;
    } catch (e) {
      print('Cars fetch error: $e');
      return null;
    }
  }

  // Get car service history
  Future<List<dynamic>?> getCarServiceHistory(String carId) async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await http.get(
        Uri.parse('$_baseUrl/client/cars/$carId/history'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return null;
    } catch (e) {
      print('Service history fetch error: $e');
      return null;
    }
  }

  // Get car inspection report
  Future<Map<String, dynamic>?> getCarInspection(String carId) async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await http.get(
        Uri.parse('$_baseUrl/client/cars/$carId/inspection'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return null;
    } catch (e) {
      print('Inspection fetch error: $e');
      return null;
    }
  }

  // Get all service history for all client cars
  Future<List<dynamic>?> getAllServiceHistory() async {
    try {
      final cars = await getClientCars();
      if (cars == null) return null;

      List<dynamic> allHistory = [];
      for (var car in cars) {
        final history = await getCarServiceHistory(car['car_id']);
        if (history != null) {
          allHistory.addAll(history);
        }
      }

      // Sort by date (most recent first)
      allHistory.sort((a, b) {
        final dateA = DateTime.parse(a['date']);
        final dateB = DateTime.parse(b['date']);
        return dateB.compareTo(dateA);
      });

      return allHistory;
    } catch (e) {
      print('All service history fetch error: $e');
      return null;
    }
  }

  // Get all inspections for all client cars
  Future<List<Map<String, dynamic>>?> getAllInspections() async {
    try {
      final cars = await getClientCars();
      if (cars == null) return null;

      List<Map<String, dynamic>> allInspections = [];
      for (var car in cars) {
        final inspection = await getCarInspection(car['car_id']);
        if (inspection != null) {
          allInspections.add(inspection);
        }
      }

      // Sort by inspection date (most recent first)
      allInspections.sort((a, b) {
        final dateA = DateTime.parse(a['inspection_date']);
        final dateB = DateTime.parse(b['inspection_date']);
        return dateB.compareTo(dateA);
      });

      return allInspections;
    } catch (e) {
      print('All inspections fetch error: $e');
      return null;
    }
  }

  // Get detailed car information
  Future<Map<String, dynamic>?> getCarDetails(String carId) async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await http.get(
        Uri.parse('$_baseUrl/client/cars/$carId'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return null;
    } catch (e) {
      print('Car details fetch error: $e');
      return null;
    }
  }

  // Get car visit history (services and inspections combined)
  Future<List<dynamic>?> getCarVisitHistory(String carId) async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await http.get(
        Uri.parse('$_baseUrl/client/cars/$carId/visits'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return null;
    } catch (e) {
      print('Car visit history fetch error: $e');
      return null;
    }
  }

  // Get specific visit details
  Future<Map<String, dynamic>?> getVisitDetails(String visitType, String visitId) async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await http.get(
        Uri.parse('$_baseUrl/client/visits/$visitType/$visitId'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return null;
    } catch (e) {
      print('Visit details fetch error: $e');
      return null;
    }
  }
}