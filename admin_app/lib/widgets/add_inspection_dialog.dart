import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/admin_provider.dart';

class AddInspectionDialog extends StatefulWidget {
  const AddInspectionDialog({super.key});

  @override
  State<AddInspectionDialog> createState() => _AddInspectionDialogState();
}

class _AddInspectionDialogState extends State<AddInspectionDialog> {
  final _formKey = GlobalKey<FormState>();
  final _technicianNotesController = TextEditingController();
  final _recommendationsController = TextEditingController();
  
  String? _selectedVehicleId;
  String _overallCondition = 'good';
  DateTime _selectedDate = DateTime.now();
  bool _isLoading = false;
  bool _isDataLoading = true;
  
  // Cache the data locally to avoid repeated provider calls
  List<dynamic> _vehicles = [];
  List<dynamic> _clients = [];
  
  // Inspection items
  final List<Map<String, dynamic>> _inspectionItems = [];

  final List<String> _conditions = ['excellent', 'good', 'fair', 'poor'];
  final List<String> _itemStatuses = ['good', 'needs_attention', 'replace'];
  final List<String> _commonItems = [
    'Engine Oil',
    'Brake Pads',
    'Tire Condition',
    'Battery',
    'Air Filter',
    'Transmission Fluid',
    'Coolant System',
    'Lights & Signals',
    'Belts & Hoses',
    'Suspension',
  ];

  @override
  void initState() {
    super.initState();
    // Start with fewer items for faster loading - user can add more as needed
    _inspectionItems.addAll([
      {'item_name': 'Engine Oil', 'status': 'good', 'notes': ''},
      {'item_name': 'Brake Pads', 'status': 'good', 'notes': ''},
      {'item_name': 'Tire Condition', 'status': 'good', 'notes': ''},
    ]);
    
    // Load data once when dialog opens
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadData());
  }
  
  Future<void> _loadData() async {
    final provider = context.read<AdminProvider>();
    _vehicles = provider.vehicles;
    _clients = provider.clients;
    
    setState(() {
      _isDataLoading = false;
    });
  }

  @override
  void dispose() {
    _technicianNotesController.dispose();
    _recommendationsController.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now().add(const Duration(days: 1)),
    );
    
    if (date != null) {
      setState(() {
        _selectedDate = date;
      });
    }
  }

  void _addCustomItem() {
    setState(() {
      _inspectionItems.add({
        'item_name': '',
        'status': 'good',
        'notes': '',
      });
    });
  }
  
  void _addCommonItems() {
    setState(() {
      // Add remaining common items that aren't already present
      for (String item in _commonItems) {
        bool alreadyExists = _inspectionItems.any((existing) => 
          existing['item_name'].toString().toLowerCase() == item.toLowerCase());
        if (!alreadyExists) {
          _inspectionItems.add({
            'item_name': item,
            'status': 'good',
            'notes': '',
          });
        }
      }
    });
  }

  void _removeItem(int index) {
    setState(() {
      _inspectionItems.removeAt(index);
    });
  }

  String _getVehicleDisplayText(dynamic vehicle) {
    return '${vehicle['make']} ${vehicle['model']} (${vehicle['license_plate']})';
  }

  String _getClientName(int? clientId) {
    if (clientId == null) return 'Unknown Client';
    
    try {
      final client = _clients.firstWhere(
        (client) => client['id'] == clientId,
      );
      return client['name'] ?? 'Unknown Client';
    } catch (e) {
      return 'Unknown Client';
    }
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final inspectionData = {
        'vehicle_id': int.parse(_selectedVehicleId!),
        'inspection_date': _selectedDate.toIso8601String(),
        'overall_condition': _overallCondition,
        'technician_notes': _technicianNotesController.text.trim().isEmpty 
            ? null : _technicianNotesController.text.trim(),
        'recommendations': _recommendationsController.text.trim().isEmpty 
            ? null : _recommendationsController.text.trim(),
        'items': _inspectionItems.where((item) => item['item_name'].toString().trim().isNotEmpty).map((item) => {
          'item_name': item['item_name'],
          'status': item['status'],
          'notes': item['notes'].toString().trim().isEmpty ? null : item['notes'],
        }).toList(),
      };

      final success = await context.read<AdminProvider>().createInspection(inspectionData);

      if (success && mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Inspection report created successfully'),
            backgroundColor: Colors.green,
          ),
        );
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to create inspection report'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Show loading state while data is being loaded
    if (_isDataLoading) {
      return const AlertDialog(
        content: SizedBox(
          width: 300,
          height: 150,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text('Loading...'),
              ],
            ),
          ),
        ),
      );
    }
    
    return AlertDialog(
      title: const Text(
        'Add Inspection Report',
        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
      ),
          content: SizedBox(
            width: 700,
            height: 600,
            child: Form(
              key: _formKey,
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Vehicle Selection
                    DropdownButtonFormField<String>(
                      decoration: const InputDecoration(
                        labelText: 'Vehicle *',
                        border: OutlineInputBorder(),
                      ),
                      value: _selectedVehicleId,
                      items: _vehicles.isEmpty 
                        ? [const DropdownMenuItem<String>(
                            value: null,
                            child: Text('No vehicles available'),
                          )]
                        : _vehicles.map<DropdownMenuItem<String>>((vehicle) {
                            return DropdownMenuItem<String>(
                              value: vehicle['id'].toString(),
                              child: Text(
                                _getVehicleDisplayText(vehicle),
                                overflow: TextOverflow.ellipsis,
                              ),
                            );
                          }).toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedVehicleId = value;
                        });
                      },
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please select a vehicle';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    
                    // Date and Overall Condition Row
                    Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: _selectDate,
                            child: InputDecorator(
                              decoration: const InputDecoration(
                                labelText: 'Inspection Date',
                                border: OutlineInputBorder(),
                                suffixIcon: Icon(Icons.calendar_today),
                              ),
                              child: Text(
                                '${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}',
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            decoration: const InputDecoration(
                              labelText: 'Overall Condition *',
                              border: OutlineInputBorder(),
                            ),
                            value: _overallCondition,
                            items: _conditions.map((condition) {
                              return DropdownMenuItem<String>(
                                value: condition,
                                child: Text(condition.toUpperCase()),
                              );
                            }).toList(),
                            onChanged: (value) {
                              if (value != null) {
                                setState(() {
                                  _overallCondition = value;
                                });
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    
                    // Technician Notes
                    TextFormField(
                      controller: _technicianNotesController,
                      decoration: const InputDecoration(
                        labelText: 'Technician Notes (Optional)',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 16),
                    
                    // Recommendations
                    TextFormField(
                      controller: _recommendationsController,
                      decoration: const InputDecoration(
                        labelText: 'Recommendations (Optional)',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 24),
                    
                    // Inspection Items Section
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Inspection Items',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Row(
                          children: [
                            TextButton.icon(
                              onPressed: _addCommonItems,
                              icon: const Icon(Icons.auto_fix_high, size: 16),
                              label: const Text('Add Common'),
                              style: TextButton.styleFrom(
                                foregroundColor: Colors.orange,
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              ),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton.icon(
                              onPressed: _addCustomItem,
                              icon: const Icon(Icons.add, size: 18),
                              label: const Text('Add Item'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blue,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    
                    // Inspection Items List
                    ...List.generate(_inspectionItems.length, (index) {
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        elevation: 2,
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            children: [
                              // Item Name Field
                              TextFormField(
                                initialValue: _inspectionItems[index]['item_name'],
                                decoration: const InputDecoration(
                                  labelText: 'Item Name',
                                  border: OutlineInputBorder(),
                                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                ),
                                onChanged: (value) {
                                  _inspectionItems[index]['item_name'] = value;
                                },
                              ),
                              const SizedBox(height: 12),
                              
                              // Status and Delete Row
                              Row(
                                children: [
                                  Expanded(
                                    child: DropdownButtonFormField<String>(
                                      decoration: const InputDecoration(
                                        labelText: 'Status',
                                        border: OutlineInputBorder(),
                                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                      ),
                                      value: _inspectionItems[index]['status'],
                                      items: _itemStatuses.map((status) {
                                        return DropdownMenuItem<String>(
                                          value: status,
                                          child: Text(
                                            status.replaceAll('_', ' ').toUpperCase(),
                                            style: const TextStyle(fontSize: 14),
                                          ),
                                        );
                                      }).toList(),
                                      onChanged: (value) {
                                        if (value != null) {
                                          setState(() {
                                            _inspectionItems[index]['status'] = value;
                                          });
                                        }
                                      },
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Container(
                                    decoration: BoxDecoration(
                                      color: Colors.red.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: IconButton(
                                      onPressed: () => _removeItem(index),
                                      icon: const Icon(Icons.delete, color: Colors.red, size: 20),
                                      tooltip: 'Remove Item',
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              
                              // Notes Field
                              TextFormField(
                                initialValue: _inspectionItems[index]['notes'],
                                decoration: const InputDecoration(
                                  labelText: 'Notes (Optional)',
                                  border: OutlineInputBorder(),
                                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                ),
                                maxLines: 2,
                                onChanged: (value) {
                                  _inspectionItems[index]['notes'] = value;
                                },
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: _isLoading ? null : _submitForm,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: _isLoading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Create Inspection'),
            ),
          ],
        );
  }

  IconData _getConditionIcon(String condition) {
    switch (condition) {
      case 'excellent':
        return Icons.star;
      case 'good':
        return Icons.check_circle;
      case 'fair':
        return Icons.warning;
      case 'poor':
        return Icons.error;
      default:
        return Icons.help;
    }
  }

  Color _getConditionColor(String condition) {
    switch (condition) {
      case 'excellent':
        return Colors.green;
      case 'good':
        return Colors.lightGreen;
      case 'fair':
        return Colors.orange;
      case 'poor':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}