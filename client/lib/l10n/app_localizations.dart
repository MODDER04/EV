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

  /// Overall condition description
  ///
  /// In en, this message translates to:
  /// **'Overall condition: {condition}'**
  String overallCondition(String condition);

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
