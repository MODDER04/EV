import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../providers/auth_provider.dart';
import '../widgets/language_switcher.dart';
import '../app_localizations.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.profile),
        automaticallyImplyLeading: false,
      ),
      body: Consumer<AppState>(
        builder: (context, appState, child) {
          final client = appState.currentClient;
          
          if (client == null) {
            return const Center(
              child: Text('No user profile available'),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Profile Header
                Center(
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 50,
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        child: Text(
                          client.name.isNotEmpty ? client.name[0].toUpperCase() : 'U',
                          style: const TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        client.name,
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        client.email ?? client.phone,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // Profile Information
                _buildSection(
                  context,
                  l10n.contactInfo,
                  [
                    _buildInfoTile(
                      context,
                      Icons.person,
                      'Full Name',
                      client.name,
                    ),
                    _buildInfoTile(
                      context,
                      Icons.phone,
                      l10n.phone,
                      client.phone,
                    ),
                    if (client.email != null)
                      _buildInfoTile(
                        context,
                        Icons.email,
                        l10n.email,
                        client.email!,
                      ),
                    _buildInfoTile(
                      context,
                      Icons.badge,
                      'Client ID',
                      client.clientId,
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Vehicle Information
                _buildSection(
                  context,
                  l10n.myCars,
                  appState.vehicles.map((vehicle) => 
                    _buildInfoTile(
                      context,
                      Icons.directions_car,
                      '${vehicle.make} ${vehicle.model}',
                      'Plate: ${vehicle.licensePlate}',
                    ),
                  ).toList(),
                ),
                const SizedBox(height: 24),

                // Settings
                _buildSection(
                  context,
                  l10n.settings,
                  [
                    // Language Switcher Card
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      child: LanguageSwitcher(showIcon: true, isCompact: false),
                    ),
                    _buildActionTile(
                      context,
                      Icons.notifications,
                      'Notifications',
                      'Manage notification preferences',
                      () {},
                    ),
                    _buildActionTile(
                      context,
                      Icons.security,
                      'Privacy & Security',
                      'Manage your privacy settings',
                      () {},
                    ),
                    _buildActionTile(
                      context,
                      Icons.help,
                      'Help & Support',
                      'Get help or contact support',
                      () {},
                    ),
                    _buildActionTile(
                      context,
                      Icons.logout,
                      l10n.logout,
                      'Sign out of your account',
                      () => _showSignOutDialog(context),
                      isDestructive: true,
                    ),
                  ],
                ),
                const SizedBox(height: 100),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildSection(BuildContext context, String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        ...children,
      ],
    );
  }

  Widget _buildInfoTile(
    BuildContext context,
    IconData icon,
    String title,
    String subtitle,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: Theme.of(context).colorScheme.primary,
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionTile(
    BuildContext context,
    IconData icon,
    String title,
    String subtitle,
    VoidCallback onTap, {
    bool isDestructive = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: (isDestructive ? Colors.red : Theme.of(context).colorScheme.primary)
                        .withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    icon,
                    color: isDestructive ? Colors.red : Theme.of(context).colorScheme.primary,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: isDestructive ? Colors.red : Colors.white,
                        ),
                      ),
                      Text(
                        subtitle,
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios,
                  color: Colors.white54,
                  size: 16,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showSignOutDialog(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.logout),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l10n.cancel),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              // Sign out using AuthProvider
              await context.read<AuthProvider>().logout();
              // Show success message immediately after logout
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Signed out successfully'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: Text(
              l10n.logout,
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
}