import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/admin_provider.dart';
import '../widgets/add_client_code_dialog.dart';

class ClientCodesScreen extends StatefulWidget {
  const ClientCodesScreen({super.key});

  @override
  State<ClientCodesScreen> createState() => _ClientCodesScreenState();
}

class _ClientCodesScreenState extends State<ClientCodesScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<dynamic> _getFilteredClientCodes(List<dynamic> codes) {
    if (_searchQuery.isEmpty) return codes;
    
    return codes.where((code) {
      final codeValue = (code['code'] ?? '').toString().toLowerCase();
      final clientName = _getClientName(code['client_id'])?.toLowerCase() ?? '';
      final query = _searchQuery.toLowerCase();
      
      return codeValue.contains(query) || clientName.contains(query);
    }).toList();
  }

  String? _getClientName(int? clientId) {
    if (clientId == null) return null;
    
    try {
      final provider = context.read<AdminProvider>();
      final client = provider.clients.firstWhere(
        (client) => client['id'] == clientId,
      );
      return client['name'];
    } catch (e) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AdminProvider>(
      builder: (context, provider, child) {
        if (provider.isClientCodesLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        final filteredCodes = _getFilteredClientCodes(provider.clientCodes);

        return Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              // Header with count and add button
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total Codes: ${provider.clientCodes.length}',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  ElevatedButton.icon(
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (context) => const AddClientCodeDialog(),
                      );
                    },
                    icon: const Icon(Icons.add),
                    label: const Text('Add Code'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              // Search bar
              TextField(
                controller: _searchController,
                decoration: const InputDecoration(
                  labelText: 'Search client codes...',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.search),
                  hintText: 'Search by code or client name',
                ),
                onChanged: (value) {
                  setState(() {
                    _searchQuery = value;
                  });
                },
              ),
              const SizedBox(height: 16),
              
              // Client codes list
              Expanded(
                child: filteredCodes.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              _searchQuery.isEmpty ? Icons.vpn_key_outlined : Icons.search_off,
                              size: 64,
                              color: Colors.grey,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _searchQuery.isEmpty 
                                  ? 'No client codes found'
                                  : 'No codes match your search',
                              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: filteredCodes.length,
                        itemBuilder: (context, index) {
                          final code = filteredCodes[index];
                          final clientName = _getClientName(code['client_id']);
                          final isActive = code['is_active'] == true;
                          return Card(
                            child: ListTile(
                              leading: Icon(
                                isActive ? Icons.check_circle : Icons.cancel,
                                color: isActive ? Colors.green : Colors.red,
                              ),
                              title: Text(
                                code['code'] ?? 'N/A',
                                style: TextStyle(
                                  fontFamily: 'monospace',
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Status: ${isActive ? "Active" : "Inactive"}'),
                                  if (clientName != null)
                                    Text('👤 Client: $clientName')
                                  else
                                    Text('👤 Unassigned'),
                                  if (code['used_at'] != null)
                                    Text('✓ Used on ${DateTime.parse(code['used_at']).toString().substring(0, 16)}'),
                                ],
                              ),
                              trailing: PopupMenuButton(
                                itemBuilder: (context) => [
                                  PopupMenuItem(
                                    value: 'toggle',
                                    child: Text(isActive ? 'Deactivate' : 'Activate'),
                                  ),
                                  const PopupMenuItem(value: 'delete', child: Text('Delete')),
                                ],
                                onSelected: (value) async {
                                  switch (value) {
                                    case 'toggle':
                                      await provider.toggleClientCode(code['id']);
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(
                                          content: Text(
                                            'Code ${isActive ? "deactivated" : "activated"}',
                                          ),
                                        ),
                                      );
                                      break;
                                    case 'delete':
                                      final confirm = await showDialog<bool>(
                                        context: context,
                                        builder: (context) => AlertDialog(
                                          title: const Text('Delete Code'),
                                          content: Text('Delete code "${code['code']}"?'),
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
                                        await provider.deleteClientCode(code['id']);
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                            content: Text('Code deleted'),
                                            backgroundColor: Colors.red,
                                          ),
                                        );
                                      }
                                      break;
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
