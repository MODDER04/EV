import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConfig {
  // MacBook IP address for physical device testing
  static const String _macBookIP = '46.247.109.35';
  
  static String get baseUrl {
    String url;
    if (kDebugMode) {
      // Development URLs
      if (Platform.isAndroid) {
        // Android emulator uses 10.0.2.2 to access host machine
        url = 'http://46.247.109.35:8000';
      } else if (Platform.isIOS) {
        // For iOS: Use MacBook IP for physical devices, localhost for simulator
        // This works for both simulator and physical device
        url = 'http://$_macBookIP:8000';
      } else {
        // Fallback for other platforms (macOS, Windows, Linux)
        url = 'http://46.247.109.35:8000';
      }
    } else {
      // Production URL - replace with your actual production API URL
      url = 'http://$_macBookIP:8000';
    }
    
    // Debug output to show which URL is being used
    print('📍 API Config: Using base URL: $url');
    return url;
  }

  // Alternative URLs for testing different configurations
  static const String androidEmulatorUrl = 'http://10.0.2.2:8000';
  static const String iOSSimulatorUrl = 'http://localhost:8000';
  static const String physicalDeviceUrl = 'http://$_macBookIP:8000';
  
  // Current MacBook IP for reference
  static String get currentMacBookIP => _macBookIP;
  
  // Method to get a custom IP address for testing
  static String getCustomDeviceUrl(String computerIP) {
    return 'http://$computerIP:8000';
  }
}