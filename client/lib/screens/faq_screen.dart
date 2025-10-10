import 'package:flutter/material.dart';
import 'package:expansion_tile_card/expansion_tile_card.dart';
import 'package:provider/provider.dart';
import '../utils/app_translations.dart';
import '../services/auth_service.dart';
import '../providers/language_provider.dart';

class FaqScreen extends StatefulWidget {
  const FaqScreen({super.key});

  @override
  State<FaqScreen> createState() => _FaqScreenState();
}

class _FaqScreenState extends State<FaqScreen> {
  final TextEditingController _searchController = TextEditingController();
  final WorkshopApiClient _apiClient = WorkshopApiClient();
  String _searchQuery = '';
  List<dynamic> _allFaqs = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadFAQs();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Reload FAQs when language changes
    final languageProvider = Provider.of<LanguageProvider>(context);
    if (mounted) {
      _loadFAQs();
    }
  }

  Future<void> _loadFAQs() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final languageProvider = Provider.of<LanguageProvider>(context, listen: false);
      final currentLanguage = languageProvider.locale.languageCode;
      
      final faqs = await _apiClient.getFAQs(language: currentLanguage);
      
      if (faqs != null) {
        setState(() {
          _allFaqs = faqs;
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = 'Failed to load FAQs';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error: $e';
        _isLoading = false;
      });
    }
  }

  List<dynamic> get _filteredFaqs {
    if (_searchQuery.isEmpty) {
      return _allFaqs;
    }
    return _allFaqs.where((faq) {
      final question = faq['question']?.toString().toLowerCase() ?? '';
      final answer = faq['answer']?.toString().toLowerCase() ?? '';
      final query = _searchQuery.toLowerCase();
      return question.contains(query) || answer.contains(query);
    }).toList();
  }

  Map<String, List<dynamic>> get _groupedFaqs {
    final grouped = <String, List<dynamic>>{};
    for (final faq in _filteredFaqs) {
      final category = faq['category']?.toString() ?? 'General';
      if (!grouped.containsKey(category)) {
        grouped[category] = [];
      }
      grouped[category]!.add(faq);
    }
    return grouped;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(context.t.faq),
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: context.t.searchFAQs,
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Theme.of(context).cardColor,
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
            ),
          ),

          // FAQ sections
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _errorMessage != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.error_outline, size: 64, color: Colors.red),
                            const SizedBox(height: 16),
                            Text(_errorMessage!),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: _loadFAQs,
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      )
                    : _filteredFaqs.isEmpty
                        ? const Center(
                            child: Text('No FAQs found matching your search.'),
                          )
                        : ListView(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            children: [
                              if (_searchQuery.isEmpty) ...[
                                // Show categories when not searching
                                ..._buildCategorySections(context),
                              ] else ...[
                                // Show all matching results when searching
                                ..._filteredFaqs.map((faq) => _buildFaqCard(faq)),
                              ],
                              const SizedBox(height: 100), // Bottom padding
                            ],
                          ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildCategorySections(BuildContext context) {
    final sections = <Widget>[];
    final groupedFaqs = _groupedFaqs;
    
    if (_searchQuery.isEmpty) {
      // Add "Common Questions" section first
      sections.add(
        Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Text(
            context.t.commonQuestions,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      );
    }

    // Add grouped categories
    final categories = ['Services', 'Booking', 'Parts', 'General'];
    for (final category in categories) {
      if (groupedFaqs.containsKey(category)) {
        if (_searchQuery.isEmpty && category == 'Services') {
          sections.add(
            Padding(
              padding: const EdgeInsets.only(top: 24, bottom: 16),
              child: Text(
                context.t.serviceDetails,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          );
        }
        
        sections.addAll(
          groupedFaqs[category]!.map((faq) => _buildFaqCard(faq)),
        );
      }
    }

    return sections;
  }

  Widget _buildFaqCard(dynamic faq) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: ExpansionTileCard(
        baseColor: Theme.of(context).cardColor,
        expandedColor: Theme.of(context).cardColor,
        elevation: 2,
        shadowColor: Colors.black26,
        borderRadius: BorderRadius.circular(12),
        title: Text(
          faq['question']?.toString() ?? 'No question',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                faq['answer']?.toString() ?? 'No answer available',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white70,
                  height: 1.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}