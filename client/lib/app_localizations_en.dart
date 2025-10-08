import 'app_localizations.dart';

class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'EvMaster Workshop';

  @override
  String get login => 'Login';

  @override
  String get logout => 'Logout';

  @override
  String get enterClientCode => 'Enter Client Code';

  @override
  String get clientCodeHint => 'Enter your client code';

  @override
  String get invalidClientCode => 'Invalid client code. Please try again.';

  @override
  String get loginError => 'Login failed. Please check your client code.';

  @override
  String get welcome => 'Welcome';

  @override
  String get profile => 'Profile';

  @override
  String get myCars => 'My Cars';

  @override
  String get carDetails => 'Car Details';

  @override
  String get visitHistory => 'Visit History';

  @override
  String get serviceHistory => 'Service History';

  @override
  String get inspectionHistory => 'Inspection History';

  @override
  String get noVisitHistory => 'No visit history found';

  @override
  String get serviceInspectionRecords => 'Service and inspection records will appear here.';

  @override
  String get vehicleStats => 'Vehicle Stats';

  @override
  String get totalServices => 'Total Services';

  @override
  String get totalInspections => 'Total Inspections';

  @override
  String get lastService => 'Last Service';

  @override
  String get lastInspection => 'Last Inspection';

  @override
  String get vehicleInspection => 'Vehicle Inspection';

  @override
  String overallCondition(String condition) => 'Overall condition: $condition';

  @override
  String get cost => 'Cost';

  @override
  String get date => 'Date';

  @override
  String get status => 'Status';

  @override
  String get completed => 'Completed';

  @override
  String get pending => 'Pending';

  @override
  String get inProgress => 'In Progress';

  @override
  String get serviceDetails => 'Service Details';

  @override
  String get inspectionDetails => 'Inspection Details';

  @override
  String get inspectionItems => 'Inspection Items';

  @override
  String get recommendations => 'Recommendations';

  @override
  String get technicianNotes => 'Technician Notes';

  @override
  String get good => 'Good';

  @override
  String get needsAttention => 'Needs Attention';

  @override
  String get fair => 'Fair';

  @override
  String get poor => 'Poor';

  @override
  String get language => 'Language';

  @override
  String get english => 'English';

  @override
  String get arabic => 'Arabic';

  @override
  String get selectLanguage => 'Select Language';

  @override
  String get settings => 'Settings';

  @override
  String get contactInfo => 'Contact Information';

  @override
  String get phone => 'Phone';

  @override
  String get email => 'Email';

  @override
  String get address => 'Address';

  @override
  String get make => 'Make';

  @override
  String get model => 'Model';

  @override
  String get year => 'Year';

  @override
  String get licensePlate => 'License Plate';

  @override
  String get loading => 'Loading...';

  @override
  String get error => 'Error';

  @override
  String get retry => 'Retry';

  @override
  String get close => 'Close';

  @override
  String get cancel => 'Cancel';

  @override
  String get save => 'Save';
}