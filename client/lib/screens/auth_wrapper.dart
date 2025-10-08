import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/app_state.dart';
import 'login_screen.dart';
import 'main_navigation_screen.dart';

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        // Show loading screen while checking authentication
        if (authProvider.isLoading) {
          return const Scaffold(
            backgroundColor: Color(0xFF121212),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // App Logo
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: Color(0xFF4A90E2),
                    child: Icon(
                      Icons.directions_car,
                      color: Colors.white,
                      size: 40,
                    ),
                  ),
                  SizedBox(height: 24),
                  Text(
                    'EVMASTER',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 2,
                    ),
                  ),
                  SizedBox(height: 32),
                  CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF4A90E2)),
                  ),
                ],
              ),
            ),
          );
        }

        // Show main app if authenticated
        if (authProvider.isAuthenticated) {
          // Force refresh data from API when authenticated
          WidgetsBinding.instance.addPostFrameCallback((_) {
            final appState = context.read<AppState>();
            if (appState.currentClient == null && !appState.isLoading) {
              print('🔑 User authenticated, force refreshing data...');
              appState.forceRefreshData();
            }
          });
          
          return const MainNavigationScreen();
        }
        
        // If not authenticated, make sure to clear any existing data
        WidgetsBinding.instance.addPostFrameCallback((_) {
          final appState = context.read<AppState>();
          if (appState.currentClient != null) {
            print('🔒 User not authenticated, clearing data...');
            appState.clearData();
          }
        });

        // Show login screen if not authenticated
        return const LoginScreen();
      },
    );
  }
}