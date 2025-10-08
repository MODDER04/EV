import 'package:flutter/material.dart';
import 'package:expansion_tile_card/expansion_tile_card.dart';

class FaqScreen extends StatefulWidget {
  const FaqScreen({super.key});

  @override
  State<FaqScreen> createState() => _FaqScreenState();
}

class _FaqScreenState extends State<FaqScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  final List<Map<String, String>> _faqs = [
    {
      'question': 'How do I book a service?',
      'answer': 'You can book a service through our app or website. Select your vehicle, choose the service, and pick a date and time.',
      'category': 'Booking'
    },
    {
      'question': 'What types of services do you offer?',
      'answer': 'We offer a comprehensive range of automotive services including oil changes, brake inspections, tire rotations, battery checks, and more.',
      'category': 'Services'
    },
    {
      'question': 'How long does a typical service take?',
      'answer': 'A standard service typically takes 1-2 hours depending on the specific services requested. We\'ll provide you with an estimated completion time when you book.',
      'category': 'Services'
    },
    {
      'question': 'Can I wait while my car is being serviced?',
      'answer': 'Yes, we have a comfortable waiting area with complimentary WiFi and refreshments. You can also choose to drop off your vehicle and pick it up later.',
      'category': 'General'
    },
    {
      'question': 'Do you use genuine parts?',
      'answer': 'Yes, we use only genuine OEM parts and high-quality aftermarket alternatives. All parts come with manufacturer warranties.',
      'category': 'Parts'
    },
    {
      'question': 'What\'s included in a standard service?',
      'answer': 'A standard service includes an oil change, filter replacement, and a general check-up of your vehicle\'s main components.',
      'category': 'Services'
    },
  ];

  List<Map<String, String>> get _filteredFaqs {
    if (_searchQuery.isEmpty) {
      return _faqs;
    }
    return _faqs.where((faq) {
      final question = faq['question']!.toLowerCase();
      final answer = faq['answer']!.toLowerCase();
      final query = _searchQuery.toLowerCase();
      return question.contains(query) || answer.contains(query);
    }).toList();
  }

  Map<String, List<Map<String, String>>> get _groupedFaqs {
    final grouped = <String, List<Map<String, String>>>{};
    for (final faq in _filteredFaqs) {
      final category = faq['category']!;
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
        title: const Text('FAQ'),
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search FAQs',
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
            child: _filteredFaqs.isEmpty
                ? const Center(
                    child: Text('No FAQs found matching your search.'),
                  )
                : ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      if (_searchQuery.isEmpty) ...[
                        // Show categories when not searching
                        ..._buildCategorySections(),
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

  List<Widget> _buildCategorySections() {
    final sections = <Widget>[];
    
    if (_searchQuery.isEmpty) {
      // Add "Common Questions" section first
      sections.add(
        Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Text(
            'Common Questions',
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
      if (_groupedFaqs.containsKey(category)) {
        if (_searchQuery.isEmpty) {
          sections.add(
            Padding(
              padding: const EdgeInsets.only(top: 24, bottom: 16),
              child: Text(
                'Service Details',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          );
        }
        
        sections.addAll(
          _groupedFaqs[category]!.map((faq) => _buildFaqCard(faq)),
        );
      }
    }

    return sections;
  }

  Widget _buildFaqCard(Map<String, String> faq) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: ExpansionTileCard(
        baseColor: Theme.of(context).cardColor,
        expandedColor: Theme.of(context).cardColor,
        elevation: 2,
        shadowColor: Colors.black26,
        borderRadius: BorderRadius.circular(12),
        title: Text(
          faq['question']!,
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
                faq['answer']!,
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