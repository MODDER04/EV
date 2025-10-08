import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../widgets/qr_scanner_card.dart';
import '../widgets/vehicle_card.dart';
import 'car_details_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with client welcome
              Consumer<AppState>(
                builder: (context, appState, child) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        'EVMASTER',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2,
                        ),
                      ),
                      const SizedBox(height: 16),
                      if (appState.currentClient != null)
                        Text(
                          'Welcome back, ${appState.currentClient!.name.split(' ').first}!',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: Theme.of(context).colorScheme.primary,
                          ),
                        ),
                    ],
                  );
                },
              ),
              const SizedBox(height: 32),
              
              // Quick Check-in Section
              Text(
                'Quick Check-in',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 16),
              const QrScannerCard(),
              const SizedBox(height: 32),
              
              // My Cars Section
              Text(
                'My Cars',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 16),
              Consumer<AppState>(
                builder: (context, appState, child) {
                  // Show loading state
                  if (appState.isLoading) {
                    return const Center(
                      child: Padding(
                        padding: EdgeInsets.all(32.0),
                        child: Column(
                          children: [
                            CircularProgressIndicator(),
                            SizedBox(height: 16),
                            Text('Loading your vehicles...'),
                          ],
                        ),
                      ),
                    );
                  }
                  
                  // Show error state
                  if (appState.errorMessage != null) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          children: [
                            Icon(Icons.error_outline, size: 48, color: Colors.red),
                            const SizedBox(height: 16),
                            Text(
                              'Error loading data',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              appState.errorMessage!,
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () => appState.retryLoadData(),
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      ),
                    );
                  }
                  
                  // Show empty state
                  if (appState.vehicles.isEmpty) {
                    return const Center(
                      child: Padding(
                        padding: EdgeInsets.all(32.0),
                        child: Column(
                          children: [
                            Icon(Icons.directions_car_outlined, size: 48, color: Colors.grey),
                            SizedBox(height: 16),
                            Text('No vehicles found'),
                            SizedBox(height: 8),
                            Text(
                              'Contact the workshop to add vehicles to your account.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    );
                  }
                  
                  return SizedBox(
                    height: 160,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: appState.vehicles.length,
                      itemBuilder: (context, index) {
                        final vehicle = appState.vehicles[index];
                        return Padding(
                          padding: EdgeInsets.only(
                            right: index == appState.vehicles.length - 1 ? 0 : 16,
                          ),
                          child: VehicleCard(
                            vehicle: vehicle,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => CarDetailsScreen(
                                    vehicle: vehicle,
                                  ),
                                ),
                              );
                            },
                          ),
                        );
                      },
                    ),
                  );
                },
              ),
              const SizedBox(height: 32),
              
              // Recent Activity Section
              Text(
                'Recent Activity',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 16),
              Consumer<AppState>(
                builder: (context, appState, child) {
                  if (appState.serviceHistory.isEmpty) {
                    return const Card(
                      child: Padding(
                        padding: EdgeInsets.all(24.0),
                        child: Column(
                          children: [
                            Icon(Icons.history, size: 48, color: Colors.grey),
                            SizedBox(height: 16),
                            Text(
                              'No recent service history',
                              style: TextStyle(fontWeight: FontWeight.w500),
                            ),
                            SizedBox(height: 8),
                            Text(
                              'Your service history will appear here after your first visit.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.grey, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    );
                  }
                  
                  // Show latest 2 service records
                  final recentServices = appState.serviceHistory.take(2).toList();
                  return Column(
                    children: recentServices.map((service) => Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: Card(
                        child: ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Color(0xFF4A90E2),
                            child: Icon(Icons.build, color: Colors.white),
                          ),
                          title: Text(service.serviceType),
                          subtitle: Text(
                            '${service.date.day}/${service.date.month}/${service.date.year} - ${service.formattedCost}',
                          ),
                          trailing: Chip(
                            label: Text(
                              service.status.toUpperCase(),
                              style: const TextStyle(fontSize: 10),
                            ),
                            backgroundColor: service.status == 'completed'
                                ? Colors.green.withOpacity(0.2)
                                : Colors.orange.withOpacity(0.2),
                          ),
                        ),
                      ),
                    )).toList(),
                  );
                },
              ),
              const SizedBox(height: 100), // Bottom padding for navigation
            ],
          ),
        ),
      ),
    );
  }
}