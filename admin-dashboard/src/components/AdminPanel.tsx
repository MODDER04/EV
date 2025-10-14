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

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <ClientsManager />;
      case 'vehicles':
        return <VehiclesManager />;
      case 'inspections':
        return <InspectionsManager />;
      case 'codes':
        return <CodesManager />;
      case 'services':
        return <ServiceRecordsManager />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="w-70 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
          >
            {/* Logo/Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 dark:bg-blue-700 rounded-lg">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">EvMaster</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Admin Panel</p>
                </div>
              </div>
            </div>

            {/* Health Status */}
            <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  healthLoading ? 'bg-yellow-500' : 
                  healthStatus?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                )} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {healthLoading ? 'Checking...' : 
                   healthStatus?.status === 'healthy' ? 'System Online' : 'System Offline'}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors',
                    activeSection === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  {getIcon(item.icon, activeSection === item.id ? 'text-blue-600' : 'text-gray-500')}
                  <span className="font-medium">{item.label}</span>
                  {item.count && (
                    <Badge variant="info" size="sm" className="ml-auto">
                      {item.count}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                EvMaster Workshop v1.0
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 capitalize">
                  {activeSection === 'services' ? 'Service Records' : activeSection}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeSection === 'dashboard' && 'Workshop overview and statistics'}
                  {activeSection === 'clients' && 'Manage client accounts'}
                  {activeSection === 'vehicles' && 'Manage vehicle records'}
                  {activeSection === 'inspections' && 'Manage vehicle inspections'}
                  {activeSection === 'codes' && 'Manage client access codes'}
                  {activeSection === 'services' && 'Manage service history'}
                  {activeSection === 'settings' && 'Application settings'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Current Time */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
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