import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/language_provider.dart';
import '../app_localizations.dart';

class LanguageSwitcher extends StatelessWidget {
  final bool showIcon;
  final bool isCompact;
  
  const LanguageSwitcher({
    super.key,
    this.showIcon = true,
    this.isCompact = false,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<LanguageProvider>(
      builder: (context, languageProvider, child) {
        if (isCompact) {
          return _buildCompactSwitcher(context, languageProvider);
        } else {
          return _buildFullSwitcher(context, languageProvider);
        }
      },
    );
  }
  
  Widget _buildCompactSwitcher(BuildContext context, LanguageProvider languageProvider) {
    return PopupMenuButton<String>(
      icon: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) Icon(Icons.language, size: 20),
          if (showIcon) const SizedBox(width: 4),
          Text(
            languageProvider.locale.languageCode.toUpperCase(),
            style: Theme.of(context).textTheme.labelMedium,
          ),
        ],
      ),
      onSelected: (String languageCode) {
        languageProvider.setLanguage(languageCode);
      },
      itemBuilder: (BuildContext context) {
        return languageProvider.getSupportedLanguages().map((language) {
          return PopupMenuItem<String>(
            value: language['code'],
            child: Row(
              children: [
                Text(
                  language['code']!.toUpperCase(),
                  style: TextStyle(
                    fontWeight: languageProvider.locale.languageCode == language['code']
                        ? FontWeight.bold
                        : FontWeight.normal,
                  ),
                ),
                const SizedBox(width: 8),
                Text(language['nativeName']!),
              ],
            ),
          );
        }).toList();
      },
    );
  }
  
  Widget _buildFullSwitcher(BuildContext context, LanguageProvider languageProvider) {
    final l10n = AppLocalizations.of(context)!;
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                if (showIcon) Icon(Icons.language),
                if (showIcon) const SizedBox(width: 8),
                Text(
                  l10n.language,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...languageProvider.getSupportedLanguages().map((language) {
              final isSelected = languageProvider.locale.languageCode == language['code'];
              return InkWell(
                onTap: () {
                  languageProvider.setLanguage(language['code']!);
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Row(
                    children: [
                      Radio<String>(
                        value: language['code']!,
                        groupValue: languageProvider.locale.languageCode,
                        onChanged: (String? value) {
                          if (value != null) {
                            languageProvider.setLanguage(value);
                          }
                        },
                      ),
                      const SizedBox(width: 8),
                      Text(
                        language['nativeName']!,
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }
}

class LanguageButton extends StatelessWidget {
  const LanguageButton({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<LanguageProvider>(
      builder: (context, languageProvider, child) {
        final l10n = AppLocalizations.of(context)!;
        
        return OutlinedButton.icon(
          icon: Icon(Icons.language),
          label: Text(languageProvider.getLanguageDisplayName()),
          onPressed: () {
            showDialog(
              context: context,
              builder: (BuildContext context) => AlertDialog(
                title: Text(l10n.selectLanguage),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: languageProvider.getSupportedLanguages().map((language) {
                    final isSelected = languageProvider.locale.languageCode == language['code'];
                    return ListTile(
                      leading: Radio<String>(
                        value: language['code']!,
                        groupValue: languageProvider.locale.languageCode,
                        onChanged: (String? value) {
                          if (value != null) {
                            languageProvider.setLanguage(value);
                            Navigator.of(context).pop();
                          }
                        },
                      ),
                      title: Text(language['nativeName']!),
                      onTap: () {
                        languageProvider.setLanguage(language['code']!);
                        Navigator.of(context).pop();
                      },
                    );
                  }).toList(),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: Text(l10n.cancel),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}