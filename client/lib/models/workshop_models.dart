class Client {
  final String clientId;
  final String name;
  final String phone;
  final String? email;

  Client({
    required this.clientId,
    required this.name,
    required this.phone,
    this.email,
  });

  factory Client.fromJson(Map<String, dynamic> json) {
    return Client(
      clientId: json['client_id'],
      name: json['name'],
      phone: json['phone'],
      email: json['email'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'client_id': clientId,
      'name': name,
      'phone': phone,
      'email': email,
    };
  }
}

class Vehicle {
  final String carId;
  final String make;
  final String model;
  final int year;
  final String licensePlate;
  final String? vin;
  final String? color;

  Vehicle({
    required this.carId,
    required this.make,
    required this.model,
    required this.year,
    required this.licensePlate,
    this.vin,
    this.color,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      carId: json['car_id'],
      make: json['make'],
      model: json['model'],
      year: json['year'],
      licensePlate: json['license_plate'],
      vin: json['vin'],
      color: json['color'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'car_id': carId,
      'make': make,
      'model': model,
      'year': year,
      'license_plate': licensePlate,
      'vin': vin,
      'color': color,
    };
  }

  String get displayName => '$make $model ($year)';
}

class ServiceRecord {
  final String serviceId;
  final String carId;
  final DateTime date;
  final String serviceType;
  final String description;
  final double cost;
  final String status;
  final String? technicianNotes;

  ServiceRecord({
    required this.serviceId,
    required this.carId,
    required this.date,
    required this.serviceType,
    required this.description,
    required this.cost,
    required this.status,
    this.technicianNotes,
  });

  factory ServiceRecord.fromJson(Map<String, dynamic> json) {
    return ServiceRecord(
      serviceId: json['service_id'],
      carId: json['car_id'],
      date: DateTime.parse(json['date']),
      serviceType: json['service_type'],
      description: json['description'],
      cost: (json['cost'] as num).toDouble(),
      status: json['status'],
      technicianNotes: json['technician_notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'service_id': serviceId,
      'car_id': carId,
      'date': date.toIso8601String(),
      'service_type': serviceType,
      'description': description,
      'cost': cost,
      'status': status,
      'technician_notes': technicianNotes,
    };
  }

  String get formattedCost => '\$${cost.toStringAsFixed(2)}';
}

class InspectionReport {
  final String inspectionId;
  final String carId;
  final DateTime inspectionDate;
  final String overallCondition;
  final String? technicianNotes;
  final String? recommendations;
  final List<InspectionItem> items;

  InspectionReport({
    required this.inspectionId,
    required this.carId,
    required this.inspectionDate,
    required this.overallCondition,
    this.technicianNotes,
    this.recommendations,
    required this.items,
  });

  factory InspectionReport.fromJson(Map<String, dynamic> json) {
    return InspectionReport(
      inspectionId: json['inspection_id'],
      carId: json['car_id'],
      inspectionDate: DateTime.parse(json['inspection_date']),
      overallCondition: json['overall_condition'],
      technicianNotes: json['technician_notes'],
      recommendations: json['recommendations'],
      items: (json['items'] as List<dynamic>? ?? [])
          .map((item) => InspectionItem.fromJson(item))
          .toList(),
    );
  }
}

class InspectionItem {
  final String itemName;
  final String status;
  final String? notes;

  InspectionItem({
    required this.itemName,
    required this.status,
    this.notes,
  });

  factory InspectionItem.fromJson(Map<String, dynamic> json) {
    return InspectionItem(
      itemName: json['item_name'],
      status: json['status'],
      notes: json['notes'],
    );
  }

  bool get isGood => status == 'good';
  bool get needsAttention => status == 'needs_attention';
  bool get needsReplacement => status == 'replace';
}