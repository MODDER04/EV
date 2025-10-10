import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en'),
  ];

  /// The main application title
  ///
  /// In en, this message translates to:
  /// **'EvMaster Workshop'**
  String get appTitle;

  /// Login button text
  ///
  /// In en, this message translates to:
  /// **'Login'**
  String get login;

  /// Logout button text
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logout;

  /// Label for client code input field
  ///
  /// In en, this message translates to:
  /// **'Enter Client Code'**
  String get enterClientCode;

  /// Hint text for client code input field
  ///
  /// In en, this message translates to:
  /// **'Enter your client code'**
  String get clientCodeHint;

  /// Error message for invalid client code
  ///
  /// In en, this message translates to:
  /// **'Invalid client code. Please try again.'**
  String get invalidClientCode;

  /// Generic login error message
  ///
  /// In en, this message translates to:
  /// **'Login failed. Please check your client code.'**
  String get loginError;

  /// Welcome greeting
  ///
  /// In en, this message translates to:
  /// **'Welcome'**
  String get welcome;

  /// Profile page title
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// My cars section title
  ///
  /// In en, this message translates to:
  /// **'My Cars'**
  String get myCars;

  /// Car details page title
  ///
  /// In en, this message translates to:
  /// **'Car Details'**
  String get carDetails;

  /// Visit history section title
  ///
  /// In en, this message translates to:
  /// **'Visit History'**
  String get visitHistory;

  /// Service history section title
  ///
  /// In en, this message translates to:
  /// **'Service History'**
  String get serviceHistory;

  /// Inspection history section title
  ///
  /// In en, this message translates to:
  /// **'Inspection History'**
  String get inspectionHistory;

  /// Message when no visit history is available
  ///
  /// In en, this message translates to:
  /// **'No visit history found'**
  String get noVisitHistory;

  /// Description for empty visit history
  ///
  /// In en, this message translates to:
  /// **'Service and inspection records will appear here.'**
  String get serviceInspectionRecords;

  /// Vehicle statistics section title
  ///
  /// In en, this message translates to:
  /// **'Vehicle Stats'**
  String get vehicleStats;

  /// Total services counter label
  ///
  /// In en, this message translates to:
  /// **'Total Services'**
  String get totalServices;

  /// Total inspections counter label
  ///
  /// In en, this message translates to:
  /// **'Total Inspections'**
  String get totalInspections;

  /// Last service date label
  ///
  /// In en, this message translates to:
  /// **'Last Service'**
  String get lastService;

  /// Last inspection date label
  ///
  /// In en, this message translates to:
  /// **'Last Inspection'**
  String get lastInspection;

  /// Vehicle inspection title
  ///
  /// In en, this message translates to:
  /// **'Vehicle Inspection'**
  String get vehicleInspection;

  /// Overall condition label
  ///
  /// In en, this message translates to:
  /// **'Overall Condition'**
  String get overallCondition;

  /// Cost label
  ///
  /// In en, this message translates to:
  /// **'Cost'**
  String get cost;

  /// Date label
  ///
  /// In en, this message translates to:
  /// **'Date'**
  String get date;

  /// Status label
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get status;

  /// Completed status
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get completed;

  /// Pending status
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get pending;

  /// In progress status
  ///
  /// In en, this message translates to:
  /// **'In Progress'**
  String get inProgress;

  /// Service details page title
  ///
  /// In en, this message translates to:
  /// **'Service Details'**
  String get serviceDetails;

  /// Inspection details page title
  ///
  /// In en, this message translates to:
  /// **'Inspection Details'**
  String get inspectionDetails;

  /// Inspection items section title
  ///
  /// In en, this message translates to:
  /// **'Inspection Items'**
  String get inspectionItems;

  /// Recommendations section title
  ///
  /// In en, this message translates to:
  /// **'Recommendations'**
  String get recommendations;

  /// Technician notes section title
  ///
  /// In en, this message translates to:
  /// **'Technician Notes'**
  String get technicianNotes;

  /// Good status
  ///
  /// In en, this message translates to:
  /// **'Good'**
  String get good;

  /// Needs attention status
  ///
  /// In en, this message translates to:
  /// **'Needs Attention'**
  String get needsAttention;

  /// Fair status
  ///
  /// In en, this message translates to:
  /// **'Fair'**
  String get fair;

  /// Poor status
  ///
  /// In en, this message translates to:
  /// **'Poor'**
  String get poor;

  /// Language settings label
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// English language option
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get english;

  /// Arabic language option
  ///
  /// In en, this message translates to:
  /// **'Arabic'**
  String get arabic;

  /// Language selection dialog title
  ///
  /// In en, this message translates to:
  /// **'Select Language'**
  String get selectLanguage;

  /// Settings page title
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// Contact information section title
  ///
  /// In en, this message translates to:
  /// **'Contact Information'**
  String get contactInfo;

  /// Phone number label
  ///
  /// In en, this message translates to:
  /// **'Phone'**
  String get phone;

  /// Email address label
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get email;

  /// Address label
  ///
  /// In en, this message translates to:
  /// **'Address'**
  String get address;

  /// Car make label
  ///
  /// In en, this message translates to:
  /// **'Make'**
  String get make;

  /// Car model label
  ///
  /// In en, this message translates to:
  /// **'Model'**
  String get model;

  /// Car year label
  ///
  /// In en, this message translates to:
  /// **'Year'**
  String get year;

  /// License plate label
  ///
  /// In en, this message translates to:
  /// **'License Plate'**
  String get licensePlate;

  /// Loading message
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get loading;

  /// Generic error message
  ///
  /// In en, this message translates to:
  /// **'Error'**
  String get error;

  /// Retry button text
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// Close button text
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get close;

  /// Cancel button text
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// Save button text
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// Home navigation label
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get home;

  /// Book navigation label
  ///
  /// In en, this message translates to:
  /// **'Book'**
  String get book;

  /// FAQ navigation label
  ///
  /// In en, this message translates to:
  /// **'FAQ'**
  String get faq;

  /// Quick check-in section title
  ///
  /// In en, this message translates to:
  /// **'Quick Check-in'**
  String get quickCheckin;

  /// QR scanner card title
  ///
  /// In en, this message translates to:
  /// **'Tap to Check In'**
  String get tapToCheckIn;

  /// QR scanner card description
  ///
  /// In en, this message translates to:
  /// **'Let us know you\'ve arrived'**
  String get letUsKnow;

  /// Recent activity section title
  ///
  /// In en, this message translates to:
  /// **'Recent Activity'**
  String get recentActivity;

  /// No vehicles message
  ///
  /// In en, this message translates to:
  /// **'No vehicles found'**
  String get noVehiclesFound;

  /// Contact workshop message
  ///
  /// In en, this message translates to:
  /// **'Contact the workshop to add vehicles to your account.'**
  String get contactWorkshop;

  /// No service history message
  ///
  /// In en, this message translates to:
  /// **'No recent service history'**
  String get noRecentHistory;

  /// Service history explanation
  ///
  /// In en, this message translates to:
  /// **'Your service history will appear here after your first visit.'**
  String get historyWillAppear;

  /// Welcome back greeting
  ///
  /// In en, this message translates to:
  /// **'Welcome back'**
  String get welcomeBack;

  /// Book a visit page title
  ///
  /// In en, this message translates to:
  /// **'Book a Visit'**
  String get bookAVisit;

  /// Select date section title
  ///
  /// In en, this message translates to:
  /// **'Select Date'**
  String get selectDate;

  /// Select time section title
  ///
  /// In en, this message translates to:
  /// **'Select Time'**
  String get selectTime;

  /// FAQ search placeholder
  ///
  /// In en, this message translates to:
  /// **'Search FAQs'**
  String get searchFAQs;

  /// Common questions section title
  ///
  /// In en, this message translates to:
  /// **'Common Questions'**
  String get commonQuestions;

  /// FAQ: What types of services
  ///
  /// In en, this message translates to:
  /// **'What types of services do you offer'**
  String get whatTypesOfServices;

  /// FAQ: How long does service take
  ///
  /// In en, this message translates to:
  /// **'How long does a typical service take'**
  String get howLongService;

  /// FAQ: What's included in service
  ///
  /// In en, this message translates to:
  /// **'What\'s included in a standard service'**
  String get whatsIncluded;

  /// FAQ: How to book a service
  ///
  /// In en, this message translates to:
  /// **'How do I book a service'**
  String get howDoIBook;

  /// FAQ: Do you use genuine parts
  ///
  /// In en, this message translates to:
  /// **'Do you use genuine parts'**
  String get genuineParts;

  /// Service statistics section title
  ///
  /// In en, this message translates to:
  /// **'Service Statistics'**
  String get serviceStatistics;

  /// Inspections counter label
  ///
  /// In en, this message translates to:
  /// **'Inspections'**
  String get inspections;

  /// Total services counter in stats
  ///
  /// In en, this message translates to:
  /// **'Total Services'**
  String get totalServicesCount;

  /// Last service date in stats
  ///
  /// In en, this message translates to:
  /// **'Last Service'**
  String get lastServiceDate;

  /// Last inspection date in stats
  ///
  /// In en, this message translates to:
  /// **'Last Inspection'**
  String get lastInspectionDate;

  /// Inspected status
  ///
  /// In en, this message translates to:
  /// **'Inspected'**
  String get inspected;

  /// Inspection report title
  ///
  /// In en, this message translates to:
  /// **'Inspection Report'**
  String get inspectionReport;

  /// Inspection summary section title
  ///
  /// In en, this message translates to:
  /// **'Inspection Summary'**
  String get inspectionSummary;

  /// Sample recommended actions
  ///
  /// In en, this message translates to:
  /// **'Replace air filter within next 3 months, Check coolant level'**
  String get recommendedActions;

  /// Engine component label
  ///
  /// In en, this message translates to:
  /// **'Engine'**
  String get engine;

  /// Brakes component label
  ///
  /// In en, this message translates to:
  /// **'Brakes'**
  String get brakes;

  /// Tires component label
  ///
  /// In en, this message translates to:
  /// **'Tires'**
  String get tires;

  /// Engine inspection note
  ///
  /// In en, this message translates to:
  /// **'Engine running smoothly, no unusual noises or vibrations'**
  String get engineRunningSmooth;

  /// Brake inspection note
  ///
  /// In en, this message translates to:
  /// **'New brake pads installed recently, good stopping power'**
  String get brakePadsInstalled;

  /// Tire inspection note
  ///
  /// In en, this message translates to:
  /// **'Tread depth is 6mm front/5mm rear'**
  String get treadDepth;

  /// Brake service title
  ///
  /// In en, this message translates to:
  /// **'Brake Service'**
  String get brakeService;

  /// Description label
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get description;

  /// Brake service description
  ///
  /// In en, this message translates to:
  /// **'Replace brake pads and check brake fluid levels'**
  String get replaceBrakePads;

  /// Completed on label
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get completedOn;

  /// Technician notes for brake service
  ///
  /// In en, this message translates to:
  /// **'Brake pads were worn down to 2mm. Replaced with new high-performance pads. Brake fluid topped up'**
  String get brakePadsWornDown;

  /// Color label
  ///
  /// In en, this message translates to:
  /// **'Color'**
  String get color;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
