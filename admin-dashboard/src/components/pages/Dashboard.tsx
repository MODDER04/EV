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
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200',
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200',
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200',
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        border: 'border-yellow-200',
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to EvMaster Workshop Admin Panel</p>
        </div>
        
        {/* System Status */}
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-3 h-3 rounded-full',
            healthLoading ? 'bg-yellow-500' : 
            healthStatus?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
          )} />
          <span className="text-sm font-medium text-gray-700">
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
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {typeof stat.value === 'string' ? stat.value : formatNumber(stat.value)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={cn(
                    'p-3 rounded-full',
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
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    System initialized successfully
                  </p>
                  <p className="text-xs text-gray-500">
                    {healthStatus?.timestamp ? new Date(healthStatus.timestamp).toLocaleString() : 'Just now'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Dashboard loaded
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
              
              {stats?.recent_services && stats.recent_services > 0 && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {stats.recent_services} recent service records
                    </p>
                    <p className="text-xs text-gray-500">
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