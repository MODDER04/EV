import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';

/// Global app translation helper
/// This provides a centralized way to handle all translations in the app
class AppTranslations {
  final BuildContext context;
  final AppLocalizations? _localizations;

  AppTranslations(this.context) : _localizations = AppLocalizations.of(context);
  
  // Fallback method to get localization with error handling
  AppLocalizations get _loc {
    if (_localizations != null) {
      return _localizations!;
    }
    // Fallback: return a dummy object with English strings if localization fails
    throw FlutterError('Localizations not available in context. Make sure MaterialApp has localizationsDelegates configured.');
  }

  // App basics
  String get appTitle => _loc.appTitle;
  String get welcome => _loc.welcome;
  String get login => _loc.login;
  String get logout => _loc.logout;
  String get loading => _loc.loading;
  String get error => _loc.error;
  String get retry => _loc.retry;
  String get cancel => _loc.cancel;
  String get save => _loc.save;
  String get close => _loc.close;

  // Auth related
  String get enterClientCode => _loc.enterClientCode;
  String get clientCodeHint => _loc.clientCodeHint;
  String get invalidClientCode => _loc.invalidClientCode;
  String get loginError => _loc.loginError;

  // Navigation/Screens
  String get profile => _loc.profile;
  String get myCars => _loc.myCars;
  String get carDetails => _loc.carDetails;
  String get settings => _loc.settings;

  // Service history
  String get visitHistory => _loc.visitHistory;
  String get serviceHistory => _loc.serviceHistory;
  String get inspectionHistory => _loc.inspectionHistory;
  String get noVisitHistory => _loc.noVisitHistory;
  String get serviceInspectionRecords => _loc.serviceInspectionRecords;
  String get vehicleInspection => _loc.vehicleInspection;

  // Vehicle info
  String get make => _loc.make;
  String get model => _loc.model;
  String get year => _loc.year;
  String get licensePlate => _loc.licensePlate;

  // Status
  String get completed => _loc.completed;
  String get pending => _loc.pending;
  String get inProgress => _loc.inProgress;
  String get good => _loc.good;
  String get fair => _loc.fair;
  String get poor => _loc.poor;
  String get needsAttention => _loc.needsAttention;

  // Common labels
  String get cost => _loc.cost;
  String get date => _loc.date;
  String get status => _loc.status;
  String get phone => _loc.phone;
  String get email => _loc.email;
  String get address => _loc.address;

  // Language
  String get language => _loc.language;
  String get english => _loc.english;
  String get arabic => _loc.arabic;
  String get selectLanguage => _loc.selectLanguage;

  // Contact info
  String get contactInfo => _loc.contactInfo;

  // Service related
  String get serviceDetails => _loc.serviceDetails;
  String get inspectionDetails => _loc.inspectionDetails;
  String get inspectionItems => _loc.inspectionItems;
  String get recommendations => _loc.recommendations;
  String get technicianNotes => _loc.technicianNotes;
  
  // Navigation
  String get home => _loc.home;
  String get book => _loc.book;
  String get faq => _loc.faq;
  
  // Home screen
  String get quickCheckin => _loc.quickCheckin;
  String get tapToCheckIn => _loc.tapToCheckIn;
  String get letUsKnow => _loc.letUsKnow;
  String get recentActivity => _loc.recentActivity;
  String get noVehiclesFound => _loc.noVehiclesFound;
  String get contactWorkshop => _loc.contactWorkshop;
  String get noRecentHistory => _loc.noRecentHistory;
  String get historyWillAppear => _loc.historyWillAppear;
  String get welcomeBack => _loc.welcomeBack;
  
  // Booking screen
  String get bookAVisit => _loc.bookAVisit;
  String get selectDate => _loc.selectDate;
  String get selectTime => _loc.selectTime;
  
  // FAQ screen
  String get searchFAQs => _loc.searchFAQs;
  String get commonQuestions => _loc.commonQuestions;
  String get whatTypesOfServices => _loc.whatTypesOfServices;
  String get howLongService => _loc.howLongService;
  String get whatsIncluded => _loc.whatsIncluded;
  String get howDoIBook => _loc.howDoIBook;
  String get genuineParts => _loc.genuineParts;
  
  // Car details screen
  String get serviceStatistics => _loc.serviceStatistics;
  String get inspections => _loc.inspections;
  String get totalServicesCount => _loc.totalServicesCount;
  String get lastServiceDate => _loc.lastServiceDate;
  String get lastInspectionDate => _loc.lastInspectionDate;
  String get overallCondition => _loc.overallCondition;
  String get inspected => _loc.inspected;
  String get color => _loc.color;
  
  // Inspection report screen
  String get inspectionReport => _loc.inspectionReport;
  String get inspectionSummary => _loc.inspectionSummary;
  String get recommendedActions => _loc.recommendedActions;
  String get engine => _loc.engine;
  String get brakes => _loc.brakes;
  String get tires => _loc.tires;
  String get engineRunningSmooth => _loc.engineRunningSmooth;
  String get brakePadsInstalled => _loc.brakePadsInstalled;
  String get treadDepth => _loc.treadDepth;
  
  // Service details screen
  String get brakeService => _loc.brakeService;
  String get description => _loc.description;
  String get replaceBrakePads => _loc.replaceBrakePads;
  String get completedOn => _loc.completedOn;
  String get brakePadsWornDown => _loc.brakePadsWornDown;
}

/// Extension method to make translations even easier
/// Usage: context.t.login instead of AppTranslations(context).login
extension AppTranslationExtension on BuildContext {
  AppTranslations get t => AppTranslations(this);
  
  // Keep the original tr method for backward compatibility
  AppLocalizations? get tr => AppLocalizations.of(this);
}

/// Static helper for getting translations without context in some cases
/// Usage: AppT.get(context).login
class AppT {
  static AppTranslations get(BuildContext context) => AppTranslations(context);
  
  // Shorthand methods for common translations
  static String loading(BuildContext context) => AppTranslations(context).loading;
  static String error(BuildContext context) => AppTranslations(context).error;
  static String retry(BuildContext context) => AppTranslations(context).retry;
  static String login(BuildContext context) => AppTranslations(context).login;
  static String logout(BuildContext context) => AppTranslations(context).logout;
}