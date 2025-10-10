import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class AdminApiService {
  static const Duration _timeout = Duration(seconds: 10);
  
  // Helper method to make HTTP requests with error handling
  Future<dynamic> _makeRequest(
    String method,
    String url, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    try {
      final defaultHeaders = {
        'Content-Type': 'application/json',
        ...?headers,
      };
      
      http.Response response;
      final uri = Uri.parse(url);
      
      switch (method.toUpperCase()) {
        case 'GET':
          response = await http.get(uri, headers: defaultHeaders).timeout(_timeout);
          break;
        case 'POST':
          response = await http.post(
            uri,
            headers: defaultHeaders,
            body: body != null ? json.encode(body) : null,
          ).timeout(_timeout);
          break;
        case 'PUT':
          response = await http.put(
            uri,
            headers: defaultHeaders,
            body: body != null ? json.encode(body) : null,
          ).timeout(_timeout);
          break;
        case 'DELETE':
          response = await http.delete(uri, headers: defaultHeaders).timeout(_timeout);
          break;
        default:
          throw Exception('Unsupported HTTP method: $method');
      }
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        if (response.body.isEmpty) return {};
        return json.decode(response.body); // Can be Map or List
      } else {
        print('❌ API Error: ${response.statusCode} - ${response.body}');
        return null;
      }
    } catch (e) {
      print('❌ Network Error: $e');
      return null;
    }
  }

  // Dashboard and Analytics
  Future<Map<String, dynamic>?> getDashboardStats() async {
    final result = await _makeRequest('GET', AdminApiConfig.dashboard);
    return result as Map<String, dynamic>?;
  }

  // Client Management
  Future<List<dynamic>?> getClients() async {
    final result = await _makeRequest('GET', AdminApiConfig.clients);
    // Backend returns direct array, not wrapped in object
    if (result is List) {
      return result;
    }
    // Fallback: if it's wrapped in object
    return result?['clients'] as List<dynamic>?;
  }

  Future<Map<String, dynamic>?> createClient(Map<String, dynamic> clientData) async {
    final result = await _makeRequest('POST', AdminApiConfig.clients, body: clientData);
    return result as Map<String, dynamic>?;
  }

  Future<bool> deleteClient(String clientId) async {
    final result = await _makeRequest('DELETE', AdminApiConfig.clientById(clientId));
    return result != null;
  }

  Future<Map<String, dynamic>?> updateClient(String clientId, Map<String, dynamic> clientData) async {
    final result = await _makeRequest('PUT', AdminApiConfig.clientById(clientId), body: clientData);
    return result as Map<String, dynamic>?;
  }

  // Vehicle Management
  Future<List<dynamic>?> getVehicles() async {
    final result = await _makeRequest('GET', AdminApiConfig.vehicles);
    // Backend returns direct array, not wrapped in object
    if (result is List) {
      return result;
    }
    // Fallback: if it's wrapped in object
    return result?['vehicles'] as List<dynamic>?;
  }

  Future<Map<String, dynamic>?> createVehicle(Map<String, dynamic> vehicleData) async {
    final result = await _makeRequest('POST', AdminApiConfig.vehicles, body: vehicleData);
    return result as Map<String, dynamic>?;
  }

  Future<bool> deleteVehicle(String vehicleId) async {
    final result = await _makeRequest('DELETE', AdminApiConfig.vehicleById(vehicleId));
    return result != null;
  }

  // Client Code Management
  Future<List<dynamic>?> getClientCodes() async {
    final result = await _makeRequest('GET', AdminApiConfig.clientCodes);
    // Backend returns direct array, not wrapped in object
    if (result is List) {
      return result;
    }
    // Fallback: if it's wrapped in object
    return result?['client_codes'] as List<dynamic>?;
  }

  Future<Map<String, dynamic>?> createClientCode(Map<String, dynamic> codeData) async {
    final result = await _makeRequest('POST', AdminApiConfig.clientCodes, body: codeData);
    return result as Map<String, dynamic>?;
  }

  Future<String?> generateCode() async {
    final result = await _makeRequest('POST', AdminApiConfig.generateCode);
    return (result as Map<String, dynamic>?)?['code'] as String?;
  }

  Future<bool> toggleClientCode(String codeId) async {
    final result = await _makeRequest('PUT', AdminApiConfig.toggleClientCode(codeId));
    return result != null;
  }

  Future<bool> deleteClientCode(String codeId) async {
    final result = await _makeRequest('DELETE', AdminApiConfig.clientCodeById(codeId));
    return result != null;
  }

  // FAQ Management (if needed for future admin functionality)
  Future<List<dynamic>?> getFAQs() async {
    final result = await _makeRequest('GET', '${AdminApiConfig.baseUrl}/faq');
    return result as List<dynamic>?;
  }

  // Inspection Management
  Future<List<dynamic>?> getInspections() async {
    final result = await _makeRequest('GET', '${AdminApiConfig.baseUrl}/admin/inspections');
    if (result is List) {
      return result;
    }
    return result?['inspections'] as List<dynamic>?;
  }

  Future<Map<String, dynamic>?> createInspection(Map<String, dynamic> inspectionData) async {
    final result = await _makeRequest('POST', '${AdminApiConfig.baseUrl}/admin/inspections', body: inspectionData);
    return result as Map<String, dynamic>?;
  }

  Future<Map<String, dynamic>?> getInspectionDetails(String inspectionId) async {
    final result = await _makeRequest('GET', '${AdminApiConfig.baseUrl}/admin/inspections/$inspectionId');
    return result as Map<String, dynamic>?;
  }

  Future<bool> deleteInspection(String inspectionId) async {
    final result = await _makeRequest('DELETE', '${AdminApiConfig.baseUrl}/admin/inspections/$inspectionId');
    return result != null;
  }

  // Service Records Management
  Future<List<dynamic>?> getServiceRecords() async {
    final result = await _makeRequest('GET', '${AdminApiConfig.baseUrl}/admin/services');
    if (result is List) {
      return result;
    }
    return result?['services'] as List<dynamic>?;
  }

  Future<Map<String, dynamic>?> createServiceRecord(Map<String, dynamic> serviceData) async {
    final result = await _makeRequest('POST', '${AdminApiConfig.baseUrl}/admin/services', body: serviceData);
    return result as Map<String, dynamic>?;
  }

  Future<Map<String, dynamic>?> getServiceDetails(String serviceId) async {
    final result = await _makeRequest('GET', '${AdminApiConfig.baseUrl}/admin/services/$serviceId');
    return result as Map<String, dynamic>?;
  }

  Future<bool> deleteServiceRecord(String serviceId) async {
    final result = await _makeRequest('DELETE', '${AdminApiConfig.baseUrl}/admin/services/$serviceId');
    return result != null;
  }

  // Health Check
  Future<bool> checkServerHealth() async {
    final result = await _makeRequest('GET', '${AdminApiConfig.baseUrl}/health');
    return (result as Map<String, dynamic>?)?['status'] == 'healthy';
  }
}