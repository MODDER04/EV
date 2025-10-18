import React, { useState } from 'react';
import { X, Edit, Car, Calendar, DollarSign, FileText } from 'lucide-react';
import { ServiceRecord } from '../../types';
import { Card, Button, Badge } from '../ui';
import { formatDate, formatCurrency } from '../../lib/utils';
import ServiceRecordFormDialog from '../forms/ServiceRecordFormDialog';

interface ServiceRecordViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceRecord: ServiceRecord;
  onEdit?: (serviceRecord: ServiceRecord) => void;
}

const ServiceRecordViewDialog: React.FC<ServiceRecordViewDialogProps> = ({
  isOpen,
  onClose,
  serviceRecord,
  onEdit,
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);

  if (!isOpen) return null;

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(serviceRecord);
    } else {
      setShowEditDialog(true);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
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
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Service Record #{serviceRecord.id}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {serviceRecord.vehicle ? `${serviceRecord.vehicle.year} ${serviceRecord.vehicle.make} ${serviceRecord.vehicle.model}` : 'Unknown Vehicle'}
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
            {/* Service Overview */}
            <Card>
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Service Overview
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                    <div className="mt-1">
                      <Badge variant={getStatusBadgeVariant(serviceRecord.status)}>
                        {serviceRecord.status === 'in_progress' ? 'In Progress' : serviceRecord.status.charAt(0).toUpperCase() + serviceRecord.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Service Date</span>
                    <div className="mt-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(serviceRecord.service_date)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Cost</span>
                    <div className="mt-1 flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(serviceRecord.total_cost || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Vehicle Information */}
            {serviceRecord.vehicle && (
              <Card>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Vehicle Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Vehicle</span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {serviceRecord.vehicle.year} {serviceRecord.vehicle.make} {serviceRecord.vehicle.model}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">License Plate</span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {serviceRecord.vehicle.license_plate || 'N/A'}
                      </div>
                    </div>
                    {serviceRecord.vehicle.vin && (
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">VIN</span>
                        <div className="font-medium text-gray-900 dark:text-gray-100 font-mono text-xs">
                          {serviceRecord.vehicle.vin}
                        </div>
                      </div>
                    )}
                    {serviceRecord.vehicle.mileage && (
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Mileage</span>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {serviceRecord.vehicle.mileage.toLocaleString()} miles
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Service Items */}
            {serviceRecord.service_items && serviceRecord.service_items.length > 0 && (
              <Card>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Service Items</h4>
                  <div className="space-y-3">
                    {serviceRecord.service_items.map((item, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {item.service_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {item.service_type}
                            </div>
                            {item.description && (
                              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {formatCurrency(item.price)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Linked Inspection */}
            {serviceRecord.linked_inspection_id && (
              <Card>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Linked Inspection</h4>
                  <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800">
                      🔗 Inspection #{serviceRecord.linked_inspection_id}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Technician Notes */}
            {serviceRecord.technician_notes && (
              <Card>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Technician Notes</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {serviceRecord.technician_notes}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Created: {formatDate(serviceRecord.created_at)}
            </div>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {showEditDialog && (
        <ServiceRecordFormDialog
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSubmit={async () => {
            setShowEditDialog(false);
          }}
          isLoading={false}
          title="Edit Service Record"
          submitLabel="Update Record"
          initialData={serviceRecord}
          vehicles={[]}
        />
      )}
    </>
  );
};

export default ServiceRecordViewDialog;