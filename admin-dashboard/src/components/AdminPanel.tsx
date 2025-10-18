import React, { useState } from 'react';
import {
  LayoutDashboard, 
  Users, 
  Car, 
  KeyRound, 
  ClipboardList,
  Settings, 
  Bell,
  Menu,
  X,
  Wrench,
  Sun,
  Moon,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { AdminSection, NavItem } from '../types';
import { useHealthCheck } from '../hooks/api';
import { Badge } from './ui';
import { useTheme } from '../contexts/ThemeContext';

// Import page components (to be created)
import Dashboard from './pages/Dashboard';
import ClientsManager from './pages/ClientsManager';
import VehiclesManager from './pages/VehiclesManager';
import InspectionsManager from './pages/InspectionsManager';
import CodesManager from './pages/CodesManager';
import ServiceRecordsManager from './pages/ServiceRecordsManager';
import SettingsPage from './pages/SettingsPage';

const AdminPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data: healthStatus, isLoading: healthLoading } = useHealthCheck();
  const { theme, toggleTheme } = useTheme();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: 'Users',
    },
    {
      id: 'vehicles',
      label: 'Vehicles',
      icon: 'Car',
    },
    {
      id: 'inspections',
      label: 'Inspections',
      icon: 'Search',
    },
    {
      id: 'codes',
      label: 'Client Codes',
      icon: 'KeyRound',
    },
    {
      id: 'services',
      label: 'Service Records',
      icon: 'ClipboardList',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'Settings',
    },
  ];

  const getIcon = (iconName: string, className?: string) => {
    const iconProps = { className: cn('h-5 w-5', className) };
    
    switch (iconName) {
      case 'LayoutDashboard':
        return <LayoutDashboard {...iconProps} />;
      case 'Users':
        return <Users {...iconProps} />;
      case 'Car':
        return <Car {...iconProps} />;
      case 'Search':
        return <Search {...iconProps} />;
      case 'KeyRound':
        return <KeyRound {...iconProps} />;
      case 'ClipboardList':
        return <ClipboardList {...iconProps} />;
      case 'Settings':
        return <Settings {...iconProps} />;
      default:
        return <LayoutDashboard {...iconProps} />;
    }
  };

  const navigateToSection = (section: AdminSection) => {
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <ClientsManager />;
      case 'vehicles':
        return <VehiclesManager />;
      case 'inspections':
        return <InspectionsManager navigateToSection={navigateToSection} />;
      case 'codes':
        return <CodesManager />;
      case 'services':
        return <ServiceRecordsManager navigateToSection={navigateToSection} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-72 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col shadow-xl"
          >
            {/* Logo/Header */}
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-xl shadow-lg">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">EvMaster</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Workshop Admin</p>
                </div>
              </div>
            </div>

            {/* Health Status */}
            <div className="px-6 py-3 border-b border-gray-200/30 dark:border-gray-700/30">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
                <div className={cn(
                  'w-3 h-3 rounded-full shadow-lg',
                  healthLoading ? 'bg-yellow-500 animate-pulse' : 
                  healthStatus?.status === 'healthy' ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'
                )} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {healthLoading ? 'Checking...' : 
                     healthStatus?.status === 'healthy' ? 'System Online' : 'System Offline'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {healthLoading ? 'Connecting...' : 'Last updated just now'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1.5">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full flex items-center gap-4 px-4 py-3.5 text-left rounded-xl transition-all duration-200 group relative overflow-hidden',
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:shadow-md'
                  )}
                >
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-4 w-full">
                    {getIcon(item.icon, cn(
                      'transition-colors duration-200',
                      activeSection === item.id ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    ))}
                    <span className={cn(
                      'font-medium transition-colors duration-200',
                      activeSection === item.id ? 'text-white' : 'group-hover:text-gray-900 dark:group-hover:text-gray-100'
                    )}>{item.label}</span>
                    {item.count && (
                      <Badge 
                        variant={activeSection === item.id ? "info" : "default"} 
                        size="sm" 
                        className={cn(
                          'ml-auto transition-colors duration-200',
                          activeSection === item.id ? 'bg-white/20 text-white' : ''
                        )}
                      >
                        {item.count}
                      </Badge>
                    )}
                  </div>
                </motion.button>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200/30 dark:border-gray-700/30">
              <div className="text-center space-y-2">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  EvMaster Workshop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  v1.0.0 • Modern Edition
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <motion.button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.button>
              
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent capitalize">
                  {activeSection === 'services' ? 'Service Records' : activeSection}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {activeSection === 'dashboard' && '📊 Workshop overview and analytics'}
                  {activeSection === 'clients' && '👥 Manage client relationships'}
                  {activeSection === 'vehicles' && '🚗 Manage vehicle fleet'}
                  {activeSection === 'inspections' && '🔍 Quality control & safety'}
                  {activeSection === 'codes' && '🔑 Access management'}
                  {activeSection === 'services' && '🔧 Service history & records'}
                  {activeSection === 'settings' && '⚙️ System configuration'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <motion.button 
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-indigo-800 dark:to-purple-800 text-yellow-600 dark:text-yellow-400 hover:from-yellow-200 hover:to-orange-200 dark:hover:from-indigo-700 dark:hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </motion.button>

              {/* Notifications */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-3 rounded-xl bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-800 dark:to-pink-800 text-red-600 dark:text-red-400 hover:from-red-200 hover:to-pink-200 dark:hover:from-red-700 dark:hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Bell className="h-5 w-5" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                />
              </motion.button>

              {/* Current Time */}
              <div className="hidden md:flex flex-col items-end">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-50/50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900/50 dark:via-slate-900/30 dark:to-gray-900/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;