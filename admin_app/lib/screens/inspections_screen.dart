import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/admin_provider.dart';
import '../widgets/add_inspection_dialog.dart';

class InspectionsScreen extends StatefulWidget {
  const InspectionsScreen({super.key});

  @override
  State<InspectionsScreen> createState() => _InspectionsScreenState();
}

class _InspectionsScreenState extends State<InspectionsScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<dynamic> _getFilteredInspections(List<dynamic> inspections) {
    if (_searchQuery.isEmpty) return inspections;
    
    return inspections.where((inspection) {
      final vehicleInfo = (inspection['vehicle_info'] ?? '').toString().toLowerCase();
      final clientName = (inspection['client_name'] ?? '').toString().toLowerCase();
      final overallCondition = (inspection['overall_condition'] ?? '').toString().toLowerCase();
      final notes = (inspection['technician_notes'] ?? '').toString().toLowerCase();
      final query = _searchQuery.toLowerCase();
      
      return vehicleInfo.contains(query) || 
             clientName.contains(query) || 
             overallCondition.contains(query) ||
             notes.contains(query);
    }).toList();
  }

  IconData _getConditionIcon(String condition) {
    switch (condition.toLowerCase()) {
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
    switch (condition.toLowerCase()) {
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

  String _formatDate(String isoDate) {
    try {
      final date = DateTime.parse(isoDate);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return 'Invalid Date';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AdminProvider>(
      builder: (context, provider, child) {
        if (provider.isInspectionsLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        final filteredInspections = _getFilteredInspections(provider.inspections);

        return Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              // Header with count and add button
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total Inspections: ${provider.inspections.length}',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  ElevatedButton.icon(
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (context) => const AddInspectionDialog(),
                      );
                    },
                    icon: const Icon(Icons.add),
                    label: const Text('Add Inspection'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              // Search bar
              TextField(
                controller: _searchController,
                decoration: const InputDecoration(
                  labelText: 'Search inspections...',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.search),
                  hintText: 'Search by vehicle, client, condition, or notes',
                ),
                onChanged: (value) {
                  setState(() {
                    _searchQuery = value;
                  });
                },
              ),
              const SizedBox(height: 16),
              
              // Inspections list
              Expanded(
                child: filteredInspections.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              _searchQuery.isEmpty ? Icons.assignment_outlined : Icons.search_off,
                              size: 64,
                              color: Colors.grey,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _searchQuery.isEmpty 
                                  ? 'No inspection reports found'
                                  : 'No inspections match your search',
                              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: filteredInspections.length,
                        itemBuilder: (context, index) {
                          final inspection = filteredInspections[index];
                          final condition = inspection['overall_condition'] ?? 'unknown';
                          
                          return Card(
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ExpansionTile(
                              leading: Icon(
                                _getConditionIcon(condition),
                                color: _getConditionColor(condition),
                                size: 32,
                              ),
                              title: Text(
                                inspection['vehicle_info'] ?? 'Unknown Vehicle',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('👤 Client: ${inspection['client_name'] ?? 'Unknown'}'),
                                  Text('📅 Date: ${_formatDate(inspection['inspection_date'] ?? '')}'),
                                  Row(
                                    children: [
                                      Icon(
                                        _getConditionIcon(condition),
                                        size: 16,
                                        color: _getConditionColor(condition),
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        'Condition: ${condition.toUpperCase()}',
                                        style: TextStyle(
                                          color: _getConditionColor(condition),
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              trailing: PopupMenuButton(
                                itemBuilder: (context) => [
                                  const PopupMenuItem(
                                    value: 'view',
                                    child: Row(
                                      children: [
                                        Icon(Icons.visibility),
                                        SizedBox(width: 8),
                                        Text('View Details'),
                                      ],
                                    ),
                                  ),
                                  const PopupMenuItem(
                                    value: 'delete',
                                    child: Row(
                                      children: [
                                        Icon(Icons.delete, color: Colors.red),
                                        SizedBox(width: 8),
                                        Text('Delete', style: TextStyle(color: Colors.red)),
                                      ],
                                    ),
                                  ),
                                ],
                                onSelected: (value) async {
                                  switch (value) {
                                    case 'view':
                                      _showInspectionDetails(context, inspection);
                                      break;
                                    case 'delete':
                                      final confirm = await showDialog<bool>(
                                        context: context,
                                        builder: (context) => AlertDialog(
                                          title: const Text('Delete Inspection'),
                                          content: Text(
                                            'Delete inspection report for "${inspection['vehicle_info']}"?\n\n'
                                            'This action cannot be undone.',
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
                                        await provider.deleteInspection(inspection['id'].toString());
                                        if (mounted) {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            const SnackBar(
                                              content: Text('Inspection report deleted successfully'),
                                              backgroundColor: Colors.red,
                                            ),
                                          );
                                        }
                                      }
                                      break;
                                  }
                                },
                              ),
                              children: [
                                Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      if (inspection['technician_notes'] != null && 
                                          inspection['technician_notes'].toString().isNotEmpty) ...[
                                        const Text(
                                          '🔧 Technician Notes:',
                                          style: TextStyle(fontWeight: FontWeight.bold),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(inspection['technician_notes']),
                                        const SizedBox(height: 12),
                                      ],
                                      
                                      if (inspection['recommendations'] != null && 
                                          inspection['recommendations'].toString().isNotEmpty) ...[
                                        const Text(
                                          '💡 Recommendations:',
                                          style: TextStyle(fontWeight: FontWeight.bold),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(inspection['recommendations']),
                                        const SizedBox(height: 12),
                                      ],
                                      
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.end,
                                        children: [
                                          TextButton.icon(
                                            onPressed: () => _showInspectionDetails(context, inspection),
                                            icon: const Icon(Icons.visibility),
                                            label: const Text('View Full Details'),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
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

  void _showInspectionDetails(BuildContext context, Map<String, dynamic> inspection) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Inspection Report #${inspection['id']}'),
        content: SizedBox(
          width: 500,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildDetailRow('Vehicle', inspection['vehicle_info']),
                _buildDetailRow('Client', inspection['client_name']),
                _buildDetailRow('Date', _formatDate(inspection['inspection_date'] ?? '')),
                _buildDetailRow('Overall Condition', inspection['overall_condition']?.toString().toUpperCase()),
                
                if (inspection['technician_notes'] != null && 
                    inspection['technician_notes'].toString().isNotEmpty) ...[
                  const SizedBox(height: 16),
                  const Text(
                    'Technician Notes:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 4),
                  Text(inspection['technician_notes']),
                ],
                
                if (inspection['recommendations'] != null && 
                    inspection['recommendations'].toString().isNotEmpty) ...[
                  const SizedBox(height: 16),
                  const Text(
                    'Recommendations:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 4),
                  Text(inspection['recommendations']),
                ],
                
                const SizedBox(height: 16),
                Text(
                  'Created: ${_formatDate(inspection['created_at'] ?? '')}',
                  style: const TextStyle(color: Colors.grey),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String? value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: Text(value ?? 'N/A'),
          ),
        ],
      ),
    );
  }
}