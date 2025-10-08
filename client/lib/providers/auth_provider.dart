import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService;
  bool _isAuthenticated = false;
  bool _isLoading = true;
  String? _clientId;
  String? _accessToken;

  AuthProvider(this._authService) {
    _checkAuthStatus();
  }

  // Getters
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get clientId => _clientId;
  String? get accessToken => _accessToken;

  // Check if user is already logged in
  Future<void> _checkAuthStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      _isAuthenticated = await _authService.isLoggedIn();
      if (_isAuthenticated) {
        _clientId = await _authService.getClientId();
        _accessToken = await _authService.getToken();
      }
    } catch (e) {
      _isAuthenticated = false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Login method
  Future<bool> login(String clientCode) async {
    print('🔑 AuthProvider: Attempting login with code: $clientCode');
    try {
      final result = await _authService.login(clientCode);
      print('📋 AuthProvider: Login result: $result');
      if (result != null) {
        _isAuthenticated = true;
        _clientId = result['client_id'];
        _accessToken = result['access_token'];
        print('✅ AuthProvider: Login successful for client ID: $_clientId');
        notifyListeners();
        return true;
      }
      print('❌ AuthProvider: Login failed - null result');
      return false;
    } catch (e) {
      print('❌ AuthProvider: Login error: $e');
      return false;
    }
  }

  // Logout method
  Future<void> logout() async {
    print('🔒 AuthProvider: Logging out...');
    await _authService.logout();
    _isAuthenticated = false;
    _clientId = null;
    _accessToken = null;
    print('✅ AuthProvider: Logout complete');
    notifyListeners();
  }

  // Refresh authentication status
  Future<void> refreshAuthStatus() async {
    await _checkAuthStatus();
  }
}