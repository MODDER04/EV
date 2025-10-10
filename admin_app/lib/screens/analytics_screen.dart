import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/admin_provider.dart';

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AdminProvider>(
      builder: (context, provider, child) {
        if (provider.isDashboardLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        final stats = provider.dashboardStats;

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'System Analytics',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 24),
              
              // Stats Cards Row
              Row(
                children: [
                  Expanded(
                    child: _AnalyticsCard(
                      title: 'Total Clients',
                      value: '${stats?['total_clients'] ?? 0}',
                      icon: Icons.people,
                      color: Colors.blue,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _AnalyticsCard(
                      title: 'Total Vehicles',
                      value: '${stats?['total_vehicles'] ?? 0}',
                      icon: Icons.directions_car,
                      color: Colors.green,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              Row(
                children: [
                  Expanded(
                    child: _AnalyticsCard(
                      title: 'Active Codes',
                      value: '${stats?['active_client_codes'] ?? 0}',
                      icon: Icons.key,
                      color: Colors.orange,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _AnalyticsCard(
                      title: 'Total Codes',
                      value: '${stats?['total_client_codes'] ?? 0}',
                      icon: Icons.code,
                      color: Colors.purple,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // System Health Section
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'System Health',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Icon(
                            provider.isServerHealthy ? Icons.check_circle : Icons.error,
                            color: provider.isServerHealthy ? Colors.green : Colors.red,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            provider.isServerHealthy ? 'Server Online' : 'Server Offline',
                            style: TextStyle(
                              color: provider.isServerHealthy ? Colors.green : Colors.red,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text('Last health check: ${DateTime.now().toString().substring(0, 19)}'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),

              // Quick Actions Section
              Text(
                'Quick Actions',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 16,
                runSpacing: 16,
                children: [
                  _QuickActionButton(
                    icon: Icons.refresh,
                    label: 'Refresh Data',
                    onPressed: () async {
                      await provider.refreshData();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Data refreshed')),
                      );
                    },
                  ),
                  _QuickActionButton(
                    icon: Icons.health_and_safety,
                    label: 'Check Health',
                    onPressed: () async {
                      await provider.checkServerHealth();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            provider.isServerHealthy ? 'Server is healthy' : 'Server is offline',
                          ),
                          backgroundColor: provider.isServerHealthy ? Colors.green : Colors.red,
                        ),
                      );
                    },
                  ),
                  _QuickActionButton(
                    icon: Icons.add_circle,
                    label: 'Generate Code',
                    onPressed: () async {
                      await provider.generateClientCode();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('New client code generated'),
                          backgroundColor: Colors.green,
                        ),
                      );
                    },
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _AnalyticsCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _AnalyticsCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 24),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: color,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onPressed;

  const _QuickActionButton({
    required this.icon,
    required this.label,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon),
      label: Text(label),
    );
  }
}
