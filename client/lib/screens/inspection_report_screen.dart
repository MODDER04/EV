import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/workshop_models.dart';
import '../providers/app_state.dart';
import '../utils/app_translations.dart';

class InspectionReportScreen extends StatelessWidget {
  final Vehicle vehicle;

  const InspectionReportScreen({
    super.key,
    required this.vehicle,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(context.t.inspectionReport),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Consumer<AppState>(
        builder: (context, appState, child) {
          final inspection = appState.inspections.firstWhere(
            (i) => i.carId == vehicle.carId,
            orElse: () => InspectionReport(
              inspectionId: 'sample_${vehicle.carId}',
              carId: vehicle.carId,
              inspectionDate: DateTime.now().subtract(const Duration(days: 7)),
              overallCondition: 'good',
              technicianNotes: 'Comprehensive inspection completed. Vehicle is in excellent condition with proper maintenance. All systems functioning normally.',
              recommendations: 'Continue with regular maintenance schedule. Next inspection recommended in 6 months.',
              items: [
                InspectionItem(
                  itemName: 'Engine Oil',
                  status: 'good',
                  notes: 'Oil level good, clean condition',
                ),
                InspectionItem(
                  itemName: 'Tire Pressure',
                  status: 'good',
                  notes: 'All tires properly inflated, good tread depth',
                ),
                InspectionItem(
                  itemName: 'Brake Pads',
                  status: 'needs_attention',
                  notes: 'Front pads at 30% - monitor closely',
                ),
                InspectionItem(
                  itemName: 'Battery',
                  status: 'good',
                  notes: 'Battery voltage normal, terminals clean',
                ),
                InspectionItem(
                  itemName: 'Air Filter',
                  status: 'replace',
                  notes: 'Filter heavily contaminated - replacement needed',
                ),
              ],
            ),
          );

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Vehicle Information Section
                _buildVehicleInfoSection(context),
                const SizedBox(height: 24),

                // Inspection Results Section
                _buildInspectionResultsSection(context, inspection),
                const SizedBox(height: 24),

                // Technician Notes Section
                _buildTechnicianNotesSection(context, inspection),
                const SizedBox(height: 24),

                // Recommendations Section
                _buildRecommendationsSection(context, inspection),
                const SizedBox(height: 100), // Bottom padding
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildVehicleInfoSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          context.t.vehicleInspection,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildInfoRow(context.t.make, vehicle.make),
                    const SizedBox(height: 8),
                    _buildInfoRow(context.t.year, vehicle.year.toString()),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildInfoRow(context.t.model, vehicle.model),
                    const SizedBox(height: 8),
                    _buildInfoRow('VIN', vehicle.vin ?? 'N/A'),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildInspectionResultsSection(
    BuildContext context,
    InspectionReport inspection,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          context.t.inspectionItems,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        ...inspection.items.map((item) => _buildInspectionItem(context, item)),
      ],
    );
  }

  Widget _buildInspectionItem(BuildContext context, InspectionItem item) {
    Color statusColor;
    IconData statusIcon;
    String statusText;

    switch (item.status) {
      case 'good':
        statusColor = const Color(0xFF50C878);
        statusIcon = Icons.check_circle;
        statusText = context.t.good;
        break;
      case 'needs_attention':
        statusColor = Colors.orange;
        statusIcon = Icons.warning;
        statusText = context.t.needsAttention;
        break;
      case 'replace':
        statusColor = Colors.red;
        statusIcon = Icons.error;
        statusText = 'Replace';
        break;
      default:
        statusColor = Colors.grey;
        statusIcon = Icons.help;
        statusText = 'Unknown';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          // Status icon
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(
              _getItemIcon(item.itemName),
              color: statusColor,
              size: 20,
            ),
          ),
          const SizedBox(width: 16),

          // Item details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.itemName,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (item.notes != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    item.notes!,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Status indicator
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: statusColor,
              shape: BoxShape.circle,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTechnicianNotesSection(
    BuildContext context,
    InspectionReport inspection,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          context.t.technicianNotes,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1E1E1E),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            inspection.technicianNotes ?? 'No notes available',
            style: const TextStyle(
              color: Colors.white70,
              height: 1.5,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRecommendationsSection(
    BuildContext context,
    InspectionReport inspection,
  ) {
    final recommendations = [
      'Top up engine oil',
      'Replace brake pads',
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          context.t.recommendations,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        ...recommendations.map((recommendation) => _buildRecommendationItem(recommendation)),
      ],
    );
  }

  Widget _buildRecommendationItem(String recommendation) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(12),
        ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: const Color(0xFF4A90E2).withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.build,
              color: Color(0xFF4A90E2),
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              recommendation,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const Icon(
            Icons.arrow_forward_ios,
            color: Colors.white54,
            size: 16,
          ),
        ],
      ),
    );
  }

  IconData _getItemIcon(String itemName) {
    switch (itemName.toLowerCase()) {
      case 'engine oil':
        return Icons.oil_barrel;
      case 'tire pressure':
        return Icons.circle;
      case 'brake pads':
        return Icons.speed;
      case 'battery':
        return Icons.battery_full;
      default:
        return Icons.build;
    }
  }
}