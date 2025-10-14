import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, Trash2, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { InspectionReport } from '../../types';
import { Card, Button, Input } from '../ui';
import InspectionFormDialog from '../forms/InspectionFormDialog';
import {
  useInspections,
  useVehicles,
  useCreateInspection,
  useUpdateInspection,
  useDeleteInspection
} from '../../hooks/api';

// Custom filter state for inspections
interface InspectionFilterState {
  search: string;
  status: 'all' | 'good' | 'needs_attention' | 'replace';
}


const InspectionsManager: React.FC = () => {
  const [selectedInspection, setSelectedInspection] = useState<InspectionReport | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [viewDetailsDialog, setViewDetailsDialog] = useState(false);
  const [filters, setFilters] = useState<InspectionFilterState>({
    search: '',
    status: 'all'
  });

  // API hooks
  const { data: inspections = [], isLoading, error } = useInspections();
  const { data: vehicles = [] } = useVehicles();
  const createInspectionMutation = useCreateInspection();
  const updateInspectionMutation = useUpdateInspection();
  const deleteInspectionMutation = useDeleteInspection();

  const handleCreateInspection = () => {
    setSelectedInspection(null);
    setShowFormDialog(true);
  };

  const handleEditInspection = (inspection: InspectionReport) => {
    setSelectedInspection(inspection);
    setShowFormDialog(true);
  };

  const handleViewDetails = (inspection: InspectionReport) => {
    setSelectedInspection(inspection);
    setViewDetailsDialog(true);
  };

  const handleDeleteInspection = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this inspection report?')) {
      try {
        await deleteInspectionMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting inspection:', error);
      }
    }
  };

  const handleSaveInspection = async (formData: any) => {
    try {
      if (selectedInspection) {
        // Update existing inspection
        await updateInspectionMutation.mutateAsync({ id: selectedInspection.id, data: formData });
      } else {
        // Create new inspection
        await createInspectionMutation.mutateAsync(formData);
      }
      
      setShowFormDialog(false);
      setSelectedInspection(null);
    } catch (error) {
      console.error('Error saving inspection:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'needs_attention':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'replace':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'needs_attention':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'replace':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Vehicle Inspections
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage vehicle inspection reports and maintenance schedules
            </p>
          </div>
        </div>
        <Card className="p-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            Loading inspections...
          </div>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Vehicle Inspections
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage vehicle inspection reports and maintenance schedules
            </p>
          </div>
        </div>
        <Card className="p-8">
          <div className="text-center text-red-500 dark:text-red-400">
            Failed to load inspections. Please check if the backend server is running.
          </div>
        </Card>
      </div>
    );
  }

  const filteredInspections = inspections.filter(inspection => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesVehicle = inspection.vehicle ? 
        `${inspection.vehicle.make} ${inspection.vehicle.model}`.toLowerCase().includes(searchLower) : false;
      const matchesPlate = inspection.vehicle?.license_plate?.toLowerCase().includes(searchLower);
      const matchesClient = inspection.vehicle?.client?.name.toLowerCase().includes(searchLower);
      
      if (!matchesVehicle && !matchesPlate && !matchesClient) {
        return false;
      }
    }
    
    if (filters.status && filters.status !== 'all') {
      if (inspection.overall_status !== filters.status) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Vehicle Inspections
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage vehicle inspection reports and maintenance schedules
          </p>
        </div>
        
        <Button onClick={handleCreateInspection}>
          <Plus className="h-4 w-4 mr-2" />
          New Inspection
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search inspections..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-9"
              />
            </div>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Statuses</option>
            <option value="good">Good</option>
            <option value="needs_attention">Needs Attention</option>
            <option value="replace">Replace</option>
          </select>
        </div>
      </Card>

      {/* Inspections Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Inspection Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInspections.map((inspection) => (
                <tr key={inspection.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {inspection.vehicle ? `${inspection.vehicle.make} ${inspection.vehicle.model}` : 'Unknown Vehicle'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {inspection.vehicle?.license_plate} • {inspection.vehicle?.year || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {inspection.vehicle?.client?.name || 'Unknown Client'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {inspection.vehicle?.client?.phone || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {new Date(inspection.inspection_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(inspection.overall_status)}`}>
                      {getStatusIcon(inspection.overall_status)}
                      <span className="ml-1">{inspection.overall_status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {inspection.items?.length || 0} items
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {inspection.items?.filter(item => item.status === 'good').length || 0} good, {' '}
                      {inspection.items?.filter(item => item.status === 'needs_attention').length || 0} needs attention, {' '}
                      {inspection.items?.filter(item => item.status === 'replace').length || 0} replace
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(inspection)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditInspection(inspection)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteInspection(inspection.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredInspections.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No inspections found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Form Dialog */}
      {showFormDialog && (
        <InspectionFormDialog
          inspection={selectedInspection}
          onSave={handleSaveInspection}
          onCancel={() => {
            setShowFormDialog(false);
            setSelectedInspection(null);
          }}
          isLoading={createInspectionMutation.isPending || updateInspectionMutation.isPending}
          vehicles={vehicles}
        />
      )}

      {/* View Details Dialog */}
      {viewDetailsDialog && selectedInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Inspection Details
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Vehicle Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Vehicle Information</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Vehicle:</span>
                      <div className="font-medium">{selectedInspection.vehicle?.make} {selectedInspection.vehicle?.model} ({selectedInspection.vehicle?.year})</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">License Plate:</span>
                      <div className="font-medium">{selectedInspection.vehicle?.license_plate}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Client:</span>
                      <div className="font-medium">{selectedInspection.vehicle?.client?.name}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Inspection Date:</span>
                      <div className="font-medium">{new Date(selectedInspection.inspection_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Overall Status</h4>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadgeClass(selectedInspection.overall_status)}`}>
                  {getStatusIcon(selectedInspection.overall_status)}
                  <span className="ml-1">{selectedInspection.overall_status}</span>
                </span>
              </div>

              {/* Inspection Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Inspection Items</h4>
                <div className="space-y-2">
                  {selectedInspection.items?.length ? (
                    selectedInspection.items.map((item) => (
                      <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {item.item_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {item.category}
                            </div>
                            {item.notes && (
                              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {item.notes}
                              </div>
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">{item.status}</span>
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No inspection items found
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedInspection.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300">{selectedInspection.notes}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <Button onClick={() => setViewDetailsDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionsManager;