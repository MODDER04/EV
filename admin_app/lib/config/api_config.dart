import 'package:flutter/foundation.dart';

class AdminApiConfig {
  // Backend server configuration
  static const String _baseUrl = 'http://localhost:8000';
  static const String _macBookIP = '192.168.100.126';
  
  static String get baseUrl {
    String url;
    if (kDebugMode) {
      // Development URLs - for web, always use localhost
      if (kIsWeb) {
        // Web browsers - use localhost
        url = _baseUrl;
      } else {
        // Mobile/Desktop apps - use MacBook IP
        url = 'http://$_macBookIP:8000';
      }
    } else {
      // Production URL
      url = kIsWeb ? _baseUrl : 'http://$_macBookIP:8000';
    }
    
    print('🌐 Admin API Config: Using base URL: $url');
    return url;
  }
  
  // Admin API endpoints
  static String get dashboard => '$baseUrl/admin/dashboard';
  static String get clients => '$baseUrl/admin/clients';
  static String get vehicles => '$baseUrl/admin/vehicles';
  static String get clientCodes => '$baseUrl/admin/client-codes';
  static String get generateCode => '$baseUrl/admin/generate-code';
  static String get faqs => '$baseUrl/admin/faqs';
  static String get analytics => '$baseUrl/admin/analytics';
  
  // Helper methods
  static String clientById(String id) => '$clients/$id';
  static String vehicleById(String id) => '$vehicles/$id';
  static String clientCodeById(String id) => '$clientCodes/$id';
  static String toggleClientCode(String id) => '$clientCodes/$id/toggle';
}