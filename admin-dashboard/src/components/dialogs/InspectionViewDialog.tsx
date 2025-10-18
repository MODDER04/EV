import React, { useState } from 'react';
import { X, Edit, Search, Calendar, CheckCircle, XCircle, AlertCircle, Car } from 'lucide-react';
import { InspectionReport } from '../../types';
import { Card, Button, Badge } from '../ui';
import { formatDate } from '../../lib/utils';
import InspectionFormDialog from '../forms/InspectionFormDialog';

interface InspectionViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: InspectionReport;
  onEdit?: (inspection: InspectionReport) => void;
}

const InspectionViewDialog: React.FC<InspectionViewDialogProps> = ({
  isOpen,
  onClose,
  inspection,
  onEdit,
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);

  if (!isOpen) return null;

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(inspection);
    } else {
      setShowEditDialog(true);
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

  const getStatusBadgeVariant = (status: string) => {
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
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Inspection Report #{inspection.id}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {inspection.vehicle ? `${inspection.vehicle.year} ${inspection.vehicle.make} ${inspection.vehicle.model}` : 'Unknown Vehicle'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditClick}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Inspection Overview */}
            <Card>
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Inspection Overview
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Overall Status</span>
                    <div className="mt-1">
                      <Badge variant={getStatusBadgeVariant(inspection.overall_status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(inspection.overall_status)}
                          {inspection.overall_status === 'needs_attention' ? 'Needs Attention' : inspection.overall_status.charAt(0).toUpperCase() + inspection.overall_status.slice(1)}
                        </span>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Inspection Date</span>
                    <div className="mt-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(inspection.inspection_date)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Items Checked</span>
                    <div className="mt-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {inspection.items?.length || 0} items
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Vehicle Information */}
            {inspection.vehicle && (
              <Card>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Vehicle Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Vehicle</span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {inspection.vehicle.year} {inspection.vehicle.make} {inspection.vehicle.model}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">License Plate</span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {inspection.vehicle.license_plate || 'N/A'}
                      </div>
                    </div>
                    {inspection.vehicle.client && (
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Client</span>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {inspection.vehicle.client.name}
                        </div>
                        {inspection.vehicle.client.phone && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {inspection.vehicle.client.phone}
                          </div>
                        )}
                      </div>
                    )}
                    {inspection.vehicle.vin && (
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">VIN</span>
                        <div className="font-medium text-gray-900 dark:text-gray-100 font-mono text-xs">
                          {inspection.vehicle.vin}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Inspection Items Summary */}
            {inspection.items && inspection.items.length > 0 && (
              <Card>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Items Summary</h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {inspection.items.filter(item => item.status === 'good').length}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">Good</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {inspection.items.filter(item => item.status === 'needs_attention').length}
                      </div>
                      <div className="text-sm text-yellow-600 dark:text-yellow-400">Needs Attention</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {inspection.items.filter(item => item.status === 'replace').length}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400">Replace</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Inspection Items Details */}
            {inspection.items && inspection.items.length > 0 && (
              <Card>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Inspection Items</h4>
                  <div className="space-y-3">
                    {inspection.items.map((item) => (
                      <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {item.item_name}
                              </div>
                              {item.category && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                  {item.category}
                                </span>
                              )}
                            </div>
                            {item.notes && (
                              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {item.notes}
                              </div>
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">
                              {item.status === 'needs_attention' ? 'Needs Attention' : item.status}
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Linked Service Record */}
            {inspection.linked_service_id && (
              <Card>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Linked Service Record</h4>
                  <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      🔗 Service Record #{inspection.linked_service_id}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Notes */}
            {inspection.notes && (
              <Card>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Inspector Notes</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {inspection.notes}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Created: {formatDate(inspection.created_at)}
              {inspection.updated_at !== inspection.created_at && (
                <span> • Updated: {formatDate(inspection.updated_at)}</span>
              )}
            </div>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {showEditDialog && (
        <InspectionFormDialog
          inspection={inspection}
          onSave={async () => {
            setShowEditDialog(false);
          }}
          onCancel={() => setShowEditDialog(false)}
          isLoading={false}
          vehicles={[]}
        />
      )}
    </>
  );
};

export default InspectionViewDialog;