import React from 'react';
import { Users, Car, KeyRound, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, LoadingSpinner, Badge } from '../ui';
import { useDashboardStats, useHealthCheck } from '../../hooks/api';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { cn } from '../../lib/utils';

const Dashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: healthStatus, isLoading: healthLoading } = useHealthCheck();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load dashboard</h3>
          <p className="text-gray-600">Please check if the backend server is running.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Clients',
      value: stats?.total_clients ?? 0,
      icon: Users,
      color: 'blue',
      description: 'Active client accounts',
    },
    {
      title: 'Vehicles',
      value: stats?.total_vehicles ?? 0,
      icon: Car,
      color: 'green',
      description: 'Registered vehicles',
    },
    {
      title: 'Client Codes',
      value: `${stats?.active_codes ?? 0}/${stats?.total_codes ?? 0}`,
      icon: KeyRound,
      color: 'purple',
      description: 'Active / Total codes',
    },
    {
      title: 'Revenue',
      value: formatCurrency(stats?.total_revenue ?? 0),
      icon: DollarSign,
      color: 'yellow',
      description: 'Total earnings',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-600/20 dark:to-indigo-600/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200/50 dark:border-blue-600/50',
      },
      green: {
        bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-600/20 dark:to-emerald-600/20',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200/50 dark:border-green-600/50',
      },
      purple: {
        bg: 'bg-gradient-to-r from-purple-500/20 to-violet-500/20 dark:from-purple-600/20 dark:to-violet-600/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200/50 dark:border-purple-600/50',
      },
      yellow: {
        bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 dark:from-yellow-600/20 dark:to-amber-600/20',
        text: 'text-yellow-600 dark:text-yellow-400',
        border: 'border-yellow-200/50 dark:border-yellow-600/50',
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Welcome to EvMaster Workshop Admin Panel</p>
        </div>
        
        {/* System Status */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-lg">
          <div className={cn(
            'w-3 h-3 rounded-full shadow-lg',
            healthLoading ? 'bg-yellow-500 animate-pulse' : 
            healthStatus?.status === 'healthy' ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'
          )} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {healthLoading ? 'Checking...' : 
             healthStatus?.status === 'healthy' ? 'System Healthy' : 'System Issues'}
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const colorClasses = getColorClasses(stat.color);
          const Icon = stat.icon;
          
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {typeof stat.value === 'string' ? stat.value : formatNumber(stat.value)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={cn(
                    'p-3 rounded-2xl shadow-lg',
                    colorClasses.bg
                  )}>
                    <Icon className={cn('h-6 w-6', colorClasses.text)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity and System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-600/30">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    System initialized successfully
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {healthStatus?.timestamp ? new Date(healthStatus.timestamp).toLocaleString() : 'Just now'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-600/30">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Dashboard loaded
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
              
              {stats?.recent_services && stats.recent_services > 0 && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200/50 dark:border-purple-600/30">
                  <div className="w-3 h-3 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {stats.recent_services} recent service records
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      In the last 30 days
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <Badge variant={healthStatus?.status === 'healthy' ? 'success' : 'danger'}>
                  {healthLoading ? 'Checking' : healthStatus?.status === 'healthy' ? 'Online' : 'Offline'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <Badge variant="success">Connected</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Admin Panel</span>
                <Badge variant="success">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Version</span>
                <span className="text-sm font-medium text-gray-900">1.0.0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Environment</span>
                <Badge variant="warning">Development</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200">
              <Users className="h-6 w-6 text-blue-600 mb-2" />
              <p className="font-medium text-blue-900">Add Client</p>
              <p className="text-xs text-blue-700">Create new client account</p>
            </button>
            
            <button className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200">
              <Car className="h-6 w-6 text-green-600 mb-2" />
              <p className="font-medium text-green-900">Add Vehicle</p>
              <p className="text-xs text-green-700">Register new vehicle</p>
            </button>
            
            <button className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200">
              <KeyRound className="h-6 w-6 text-purple-600 mb-2" />
              <p className="font-medium text-purple-900">Generate Code</p>
              <p className="text-xs text-purple-700">Create access code</p>
            </button>
            
            <button className="p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200">
              <Activity className="h-6 w-6 text-orange-600 mb-2" />
              <p className="font-medium text-orange-900">Service Record</p>
              <p className="text-xs text-orange-700">Add service entry</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;