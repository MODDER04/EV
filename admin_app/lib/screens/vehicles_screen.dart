import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/admin_provider.dart';
import '../widgets/add_vehicle_dialog.dart';

class VehiclesScreen extends StatefulWidget {
  const VehiclesScreen({super.key});

  @override
  State<VehiclesScreen> createState() => _VehiclesScreenState();
}

class _VehiclesScreenState extends State<VehiclesScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<dynamic> _getFilteredVehicles(List<dynamic> vehicles) {
    if (_searchQuery.isEmpty) return vehicles;
    
    return vehicles.where((vehicle) {
      final make = (vehicle['make'] ?? '').toString().toLowerCase();
      final model = (vehicle['model'] ?? '').toString().toLowerCase();
      final licensePlate = (vehicle['license_plate'] ?? '').toString().toLowerCase();
      final year = (vehicle['year'] ?? '').toString();
      final vin = (vehicle['vin'] ?? '').toString().toLowerCase();
      final query = _searchQuery.toLowerCase();
      
      return make.contains(query) || 
             model.contains(query) || 
             licensePlate.contains(query) || 
             year.contains(query) ||
             vin.contains(query);
    }).toList();
  }

  String _getClientName(AdminProvider provider, int? clientId) {
    if (clientId == null) return 'Unknown Client';
    
    try {
      final client = provider.clients.firstWhere(
        (client) => client['id'] == clientId,
      );
      return client['name'] ?? 'Unknown Client';
    } catch (e) {
      return 'Unknown Client';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AdminProvider>(
      builder: (context, provider, child) {
        if (provider.isVehiclesLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        final filteredVehicles = _getFilteredVehicles(provider.vehicles);

        return Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              // Header with count and add button
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total Vehicles: ${provider.vehicles.length}',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  ElevatedButton.icon(
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (context) => const AddVehicleDialog(),
                      );
                    },
                    icon: const Icon(Icons.add),
                    label: const Text('Add Vehicle'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              // Search bar
              TextField(
                controller: _searchController,
                decoration: const InputDecoration(
                  labelText: 'Search vehicles...',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.search),
                  hintText: 'Search by make, model, license plate, year, or VIN',
                ),
                onChanged: (value) {
                  setState(() {
                    _searchQuery = value;
                  });
                },
              ),
              const SizedBox(height: 16),
              
              // Vehicles list
              Expanded(
                child: filteredVehicles.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              _searchQuery.isEmpty ? Icons.directions_car_outlined : Icons.search_off,
                              size: 64,
                              color: Colors.grey,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _searchQuery.isEmpty 
                                  ? 'No vehicles found'
                                  : 'No vehicles match your search',
                              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: filteredVehicles.length,
                        itemBuilder: (context, index) {
                          final vehicle = filteredVehicles[index];
                          final clientName = _getClientName(provider, vehicle['client_id']);
                          
                          return Card(
                            child: ListTile(
                              leading: const Icon(Icons.directions_car),
                              title: Text('${vehicle['make']} ${vehicle['model']}'),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('👤 Owner: $clientName'),
                                  Text('📅 ${vehicle['year']} • 🚗 ${vehicle['license_plate']}'),
                                  if (vehicle['color'] != null)
                                    Text('🎨 ${vehicle['color']}'),
                                ],
                              ),
                              trailing: PopupMenuButton(
                                itemBuilder: (context) => [
                                  const PopupMenuItem(value: 'edit', child: Text('Edit')),
                                  const PopupMenuItem(value: 'delete', child: Text('Delete')),
                                ],
                                onSelected: (value) async {
                                  if (value == 'delete') {
                                    final confirm = await showDialog<bool>(
                                      context: context,
                                      builder: (context) => AlertDialog(
                                        title: const Text('Delete Vehicle'),
                                        content: Text(
                                          'Delete vehicle "${vehicle['make']} ${vehicle['model']}"?\n\n'
                                          'This will also remove all associated service records and inspection reports.',
                                        ),
                                        actions: [
                                          TextButton(
                                            onPressed: () => Navigator.pop(context, false),
                                            child: const Text('Cancel'),
                                          ),
                                          ElevatedButton(
                                            onPressed: () => Navigator.pop(context, true),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: Colors.red,
                                            ),
                                            child: const Text('Delete'),
                                          ),
                                        ],
                                      ),
                                    );
                                    if (confirm == true) {
                                      await provider.deleteVehicle(vehicle['id'].toString());
                                      if (mounted) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                            content: Text('Vehicle deleted successfully'),
                                            backgroundColor: Colors.red,
                                          ),
                                        );
                                      }
                                    }
                                  }
                                },
                              ),
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        );
      },
    );
  }
}
