import React, { useState, useMemo } from 'react';
import { X, Car, Calendar, DollarSign, Search, CheckCircle, XCircle, AlertCircle, FileText, Filter } from 'lucide-react';
import { Vehicle, ServiceRecord, InspectionReport } from '../../types';
import { Card, Button, Badge, LoadingSpinner } from '../ui';
import { formatDate, formatCurrency } from '../../lib/utils';
import { useServiceRecordsByVehicle, useInspectionsByVehicle } from '../../hooks/api';
import ServiceRecordViewDialog from './ServiceRecordViewDialog';
import InspectionViewDialog from './InspectionViewDialog';

interface VehicleHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}

type HistoryFilter = 'all' | 'services' | 'inspections';
type SortOption = 'date_desc' | 'date_asc' | 'type';

interface HistoryItem {
  id: number;
  type: 'service' | 'inspection';
  date: string;
  title: string;
  status: string;
  cost?: number;
  data: ServiceRecord | InspectionReport;
}

const VehicleHistoryDialog: React.FC<VehicleHistoryDialogProps> = ({
  isOpen,
  onClose,
  vehicle,
}) => {
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [viewingService, setViewingService] = useState<ServiceRecord | null>(null);
  const [viewingInspection, setViewingInspection] = useState<InspectionReport | null>(null);

  const { data: serviceRecords = [], isLoading: loadingServices } = useServiceRecordsByVehicle(vehicle.id);
  const { data: inspections = [], isLoading: loadingInspections } = useInspectionsByVehicle(vehicle.id);

  const isLoading = loadingServices || loadingInspections;

  const historyItems: HistoryItem[] = useMemo(() => {
    const items: HistoryItem[] = [];

    // Add service records
    serviceRecords.forEach(service => {
      items.push({
        id: service.id,
        type: 'service',
        date: service.service_date,
        title: service.service_items?.map(item => item.service_name).join(', ') || 'Service Record',
        status: service.status,
        cost: service.total_cost,
        data: service,
      });
    });

    // Add inspections
    inspections.forEach(inspection => {
      items.push({
        id: inspection.id,
        type: 'inspection',
        date: inspection.inspection_date,
        title: 'Vehicle Inspection',
        status: inspection.overall_status,
        data: inspection,
      });
    });

    // Apply filters
    let filteredItems = items;
    if (filter !== 'all') {
      filteredItems = items.filter(item => 
        filter === 'services' ? item.type === 'service' : item.type === 'inspection'
      );
    }

    // Apply sorting
    filteredItems.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'type':
          if (a.type === b.type) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
          return a.type === 'service' ? -1 : 1;
        default:
          return 0;
      }
    });

    return filteredItems;
  }, [serviceRecords, inspections, filter, sortBy]);

  const getStatusBadgeVariant = (type: 'service' | 'inspection', status: string) => {
    if (type === 'service') {
      switch (status) {
        case 'completed':
          return 'success';
        case 'in_progress':
          return 'warning';
        case 'scheduled':
          return 'info';
        default:
          return 'info';
      }
    } else {
      switch (status) {
        case 'good':
          return 'success';
        case 'needs_attention':
          return 'warning';
        case 'replace':
          return 'danger';
        default:
          return 'info';
      }
    }
  };

  const getStatusIcon = (type: 'service' | 'inspection', status: string) => {
    if (type === 'service') {
      return <FileText className="h-4 w-4" />;
    } else {
      switch (status) {
        case 'good':
          return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'needs_attention':
          return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        case 'replace':
          return <XCircle className="h-4 w-4 text-red-500" />;
        default:
          return <Search className="h-4 w-4" />;
      }
    }
  };

  const handleItemClick = (item: HistoryItem) => {
    if (item.type === 'service') {
      setViewingService(item.data as ServiceRecord);
    } else {
      setViewingInspection(item.data as InspectionReport);
    }
  };

  const getTotalCost = () => {
    return serviceRecords.reduce((total, service) => total + (service.total_cost || 0), 0);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Vehicle History
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {vehicle.year} {vehicle.make} {vehicle.model} • {vehicle.license_plate}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Vehicle Summary */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {serviceRecords.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Service Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {inspections.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Inspections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(getTotalCost())}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Service Cost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {historyItems.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Records</div>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All ({historyItems.length})
                </Button>
                <Button
                  variant={filter === 'services' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('services')}
                >
                  Services ({serviceRecords.length})
                </Button>
                <Button
                  variant={filter === 'inspections' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('inspections')}
                >
                  Inspections ({inspections.length})
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="date_desc">Latest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="type">Group by Type</option>
                </select>
              </div>
            </div>
          </div>

          {/* History Timeline */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : historyItems.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No history records found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  This vehicle doesn't have any service records or inspections yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyItems.map((item, index) => (
                  <Card key={`${item.type}-${item.id}`} className="hover:shadow-md transition-shadow cursor-pointer">
                    <div 
                      className="p-4"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Timeline indicator */}
                          <div className="flex flex-col items-center">
                            <div className={`p-2 rounded-full ${
                              item.type === 'service' 
                                ? 'bg-green-100 dark:bg-green-900/20' 
                                : 'bg-blue-100 dark:bg-blue-900/20'
                            }`}>
                              {getStatusIcon(item.type, item.status)}
                            </div>
                            {index < historyItems.length - 1 && (
                              <div className="w-0.5 h-8 bg-gray-200 dark:bg-gray-700 mt-2"></div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant={item.type === 'service' ? 'success' : 'info'}
                                size="sm"
                              >
                                {item.type === 'service' ? 'Service' : 'Inspection'}
                              </Badge>
                              <Badge 
                                variant={getStatusBadgeVariant(item.type, item.status)}
                                size="sm"
                              >
                                {item.type === 'service' 
                                  ? (item.status === 'in_progress' ? 'In Progress' : item.status.charAt(0).toUpperCase() + item.status.slice(1))
                                  : (item.status === 'needs_attention' ? 'Needs Attention' : item.status.charAt(0).toUpperCase() + item.status.slice(1))
                                }
                              </Badge>
                            </div>
                            
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {item.title}
                            </h4>
                            
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(item.date)}
                              </div>
                              {item.cost && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {formatCurrency(item.cost)}
                                </div>
                              )}
                              {item.type === 'service' && (item.data as ServiceRecord).service_items && (
                                <div className="text-xs">
                                  {(item.data as ServiceRecord).service_items!.length} service{(item.data as ServiceRecord).service_items!.length !== 1 ? 's' : ''}
                                </div>
                              )}
                              {item.type === 'inspection' && (item.data as InspectionReport).items && (
                                <div className="text-xs">
                                  {(item.data as InspectionReport).items!.length} item{(item.data as InspectionReport).items!.length !== 1 ? 's' : ''} checked
                                </div>
                              )}
                            </div>

                            {/* Quick preview */}
                            {item.type === 'service' && (item.data as ServiceRecord).technician_notes && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                                {(item.data as ServiceRecord).technician_notes}
                              </p>
                            )}
                            {item.type === 'inspection' && (item.data as InspectionReport).notes && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                                {(item.data as InspectionReport).notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Linked indicator */}
                        {((item.type === 'service' && (item.data as ServiceRecord).linked_inspection_id) ||
                          (item.type === 'inspection' && (item.data as InspectionReport).linked_service_id)) && (
                          <div className="ml-4">
                            <Badge variant="info" size="sm">
                              🔗 Linked
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {vehicle.client?.name && `Owner: ${vehicle.client.name}`}
              {vehicle.vin && ` • VIN: ${vehicle.vin}`}
            </div>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Service Record Detail Dialog */}
      {viewingService && (
        <ServiceRecordViewDialog
          isOpen={!!viewingService}
          onClose={() => setViewingService(null)}
          serviceRecord={viewingService}
        />
      )}

      {/* Inspection Detail Dialog */}
      {viewingInspection && (
        <InspectionViewDialog
          isOpen={!!viewingInspection}
          onClose={() => setViewingInspection(null)}
          inspection={viewingInspection}
        />
      )}
    </>
  );
};

export default VehicleHistoryDialog;