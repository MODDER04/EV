import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;
import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';

abstract class AppLocalizations {
  AppLocalizations(String locale) : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates = <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en')
  ];

  String get appTitle;
  String get login;
  String get logout;
  String get enterClientCode;
  String get clientCodeHint;
  String get invalidClientCode;
  String get loginError;
  String get welcome;
  String get profile;
  String get myCars;
  String get carDetails;
  String get visitHistory;
  String get serviceHistory;
  String get inspectionHistory;
  String get noVisitHistory;
  String get serviceInspectionRecords;
  String get vehicleStats;
  String get totalServices;
  String get totalInspections;
  String get lastService;
  String get lastInspection;
  String get vehicleInspection;
  String overallCondition(String condition);
  String get cost;
  String get date;
  String get status;
  String get completed;
  String get pending;
  String get inProgress;
  String get serviceDetails;
  String get inspectionDetails;
  String get inspectionItems;
  String get recommendations;
  String get technicianNotes;
  String get good;
  String get needsAttention;
  String get fair;
  String get poor;
  String get language;
  String get english;
  String get arabic;
  String get selectLanguage;
  String get settings;
  String get contactInfo;
  String get phone;
  String get email;
  String get address;
  String get make;
  String get model;
  String get year;
  String get licensePlate;
  String get loading;
  String get error;
  String get retry;
  String get close;
  String get cancel;
  String get save;
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) => <String>['ar', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  switch (locale.languageCode) {
    case 'ar': return AppLocalizationsAr();
    case 'en': return AppLocalizationsEn();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.'
  );
}