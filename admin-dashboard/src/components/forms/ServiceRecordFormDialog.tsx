import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import { Input, Button } from '../ui';
import { ServiceRecord, Vehicle, ServiceRecordFormData, ServiceItemFormData, ServiceType } from '../../types';
import { formatDateForInput, formatCurrency } from '../../lib/utils';
import { Plus, Trash2, Wrench } from 'lucide-react';
import { inspectionsApi } from '../../lib/api';

interface ServiceRecordFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceRecordFormData) => Promise<void>;
  isLoading?: boolean;
  title: string;
  submitLabel: string;
  initialData?: ServiceRecord;
  vehicles: Vehicle[];
}

const ServiceRecordFormDialog: React.FC<ServiceRecordFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  title,
  submitLabel,
  initialData,
  vehicles,
}) => {
  const [formData, setFormData] = useState<ServiceRecordFormData>({
    vehicle_id: 0,
    service_date: formatDateForInput(new Date()),
    status: 'completed',
    technician_notes: '',
    service_items: [],
  });

  const [errors, setErrors] = useState<Partial<ServiceRecordFormData>>({});
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [availableInspections, setAvailableInspections] = useState<any[]>([]);
  const [linkedInspectionId, setLinkedInspectionId] = useState<number | null>(null);

  // Load service types
  useEffect(() => {
    const loadServiceTypes = async () => {
      try {
        const response = await fetch('/admin/service-types');
        if (response.ok) {
          const data = await response.json();
          setServiceTypes(data.service_types || []);
        }
      } catch (error) {
        console.error('Failed to load service types:', error);
        // Set default service types if API fails
        setServiceTypes([
          { type: 'oil_change', name: 'Oil Change', description: 'Engine oil and filter replacement', base_price: 120.0 },
          { type: 'inspection', name: 'Vehicle Inspection', description: 'Comprehensive safety inspection', base_price: 80.0 },
          { type: 'tire_rotation', name: 'Tire Rotation', description: 'Rotate tires for even wear', base_price: 60.0 },
          { type: 'brake_check', name: 'Brake Inspection', description: 'Check brake pads and fluid', base_price: 90.0 },
          { type: 'battery_check', name: 'Battery Test', description: 'Test battery and charging system', base_price: 50.0 },
        ]);
      }
    };

    if (isOpen) {
      loadServiceTypes();
    }
  }, [isOpen]);

  // Load available inspections when vehicle changes
  useEffect(() => {
    const loadVehicleInspections = async () => {
      if (formData.vehicle_id > 0) {
        try {
          console.log(`Loading inspections for vehicle ${formData.vehicle_id}`);
          const response = await inspectionsApi.getByVehicleIdForLinking(formData.vehicle_id);
          console.log('Inspections loaded:', response.data);
          setAvailableInspections(response.data || []);
        } catch (error) {
          console.error('Failed to load inspections:', error);
          setAvailableInspections([]);
        }
      } else {
        setAvailableInspections([]);
        setLinkedInspectionId(null);
      }
    };

    if (isOpen) {
      loadVehicleInspections();
    }
  }, [isOpen, formData.vehicle_id]);

  // Reset form when dialog opens/closes or initial data changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Handle date conversion more safely
        let serviceDateForInput;
        try {
          const date = new Date(initialData.service_date);
          if (isNaN(date.getTime())) {
            serviceDateForInput = formatDateForInput(new Date());
          } else {
            serviceDateForInput = formatDateForInput(date);
          }
        } catch (error) {
          serviceDateForInput = formatDateForInput(new Date());
        }
        
        setFormData({
          vehicle_id: initialData.vehicle_id,
          service_date: serviceDateForInput,
          status: initialData.status || 'completed',
          technician_notes: initialData.technician_notes || '',
          service_items: initialData.service_items || [],
        });
        // Set linked inspection if available
        if (initialData.linked_inspection_id) {
          setLinkedInspectionId(initialData.linked_inspection_id);
        }
      } else {
        setFormData({
          vehicle_id: 0,
          service_date: formatDateForInput(new Date()),
          status: 'completed',
          technician_notes: '',
          service_items: [],
        });
        setLinkedInspectionId(null);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Service item management functions
  const addServiceItem = () => {
    const newItem: ServiceItemFormData = {
      service_type: '',
      service_name: '',
      description: '',
      price: 0,
    };
    
    setFormData(prev => ({
      ...prev,
      service_items: [...prev.service_items, newItem],
    }));
  };

  const removeServiceItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      service_items: prev.service_items.filter((_, i) => i !== index),
    }));
  };

  const updateServiceItem = (index: number, field: keyof ServiceItemFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      service_items: prev.service_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addServiceFromType = (serviceType: ServiceType) => {
    const newItem: ServiceItemFormData = {
      service_type: serviceType.type,
      service_name: serviceType.name,
      description: serviceType.description,
      price: serviceType.base_price,
    };
    
    setFormData(prev => ({
      ...prev,
      service_items: [...prev.service_items, newItem],
    }));
  };

  // Auto-add inspection service when inspection is linked
  useEffect(() => {
    if (linkedInspectionId && serviceTypes.length > 0) {
      const inspectionServiceType = serviceTypes.find(st => st.type === 'inspection');
      const hasInspectionService = formData.service_items.some(item => 
        item.service_type === 'inspection' || 
        item.service_name.toLowerCase().includes('inspection')
      );
      
      if (inspectionServiceType && !hasInspectionService) {
        const inspectionService: ServiceItemFormData = {
          service_type: inspectionServiceType.type,
          service_name: inspectionServiceType.name,
          description: inspectionServiceType.description,
          price: inspectionServiceType.base_price,
        };
        
        setFormData(prev => ({
          ...prev,
          service_items: [inspectionService, ...prev.service_items],
        }));
      }
    } else if (!linkedInspectionId) {
      // Remove inspection service if inspection is unlinked
      setFormData(prev => ({
        ...prev,
        service_items: prev.service_items.filter(item => 
          item.service_type !== 'inspection' && 
          !item.service_name.toLowerCase().includes('inspection')
        ),
      }));
    }
  }, [linkedInspectionId, serviceTypes]);

  // Calculate total cost
  const calculateTotal = () => {
    return formData.service_items.reduce((total, item) => total + (item.price || 0), 0);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ServiceRecordFormData> = {};

    if (!formData.vehicle_id) {
      newErrors.vehicle_id = 0; // Using 0 to indicate error for vehicle_id
    }
    if (!formData.service_date) {
      newErrors.service_date = 'Service date is required';
    }
    if (formData.service_items.length === 0) {
      // We'll show an error in the UI for this
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && formData.service_items.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        linked_inspection_id: linkedInspectionId || undefined
      };
      await onSubmit(submitData);
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handleInputChange = (field: keyof ServiceRecordFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-4xl max-h-[95vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      
      <DialogContent className="flex-1 overflow-y-auto p-0">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
            {/* Vehicle Selection */}
            <div>
              <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vehicle *
              </label>
              <select
                id="vehicle"
                value={formData.vehicle_id}
                onChange={(e) => handleInputChange('vehicle_id', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                  errors.vehicle_id !== undefined ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value={0}>Select a vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.license_plate}
                  </option>
                ))}
              </select>
              {errors.vehicle_id !== undefined && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">Please select a vehicle</p>
              )}
            </div>

            {/* Service Date and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="service_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service Date *
                </label>
                <Input
                  id="service_date"
                  type="date"
                  value={formData.service_date}
                  onChange={(e) => handleInputChange('service_date', e.target.value)}
                  error={errors.service_date}
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Services Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Services * ({formData.service_items.length})
                </label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addServiceItem}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Custom Service
                  </Button>
                </div>
              </div>

              {/* Quick Add Service Types */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick Add:</p>
                <div className="flex flex-wrap gap-2">
                  {serviceTypes.map((serviceType) => (
                    <button
                      key={serviceType.type}
                      type="button"
                      onClick={() => addServiceFromType(serviceType)}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                      title={serviceType.description}
                    >
                      <Wrench className="h-3 w-3 mr-1" />
                      {serviceType.name} ({formatCurrency(serviceType.base_price)})
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Items List */}
              {formData.service_items.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <Wrench className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No services added yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Add services using the buttons above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.service_items.map((item, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Service #{index + 1}
                          </h4>
                          {(item.service_type === 'inspection' || item.service_name.toLowerCase().includes('inspection')) && linkedInspectionId && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                              <Wrench className="h-3 w-3 mr-1" />
                              Linked Inspection
                            </span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeServiceItem(index)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                          disabled={(item.service_type === 'inspection' || item.service_name.toLowerCase().includes('inspection')) && linkedInspectionId}
                          title={(item.service_type === 'inspection' || item.service_name.toLowerCase().includes('inspection')) && linkedInspectionId ? 
                            'Cannot remove linked inspection service. Unlink the inspection first.' : 'Remove service'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Service Name *
                          </label>
                          <Input
                            type="text"
                            value={item.service_name}
                            onChange={(e) => updateServiceItem(index, 'service_name', e.target.value)}
                            placeholder="e.g., Oil Change"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Price *
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.price.toString()}
                            onChange={(e) => updateServiceItem(index, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                          </label>
                          <Input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => updateServiceItem(index, 'description', e.target.value)}
                            placeholder="Brief description of the service"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Cost Display */}
              {formData.service_items.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Cost:
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              )}
            </div>


            {/* Linked Inspection */}
            {formData.vehicle_id > 0 && (
              <div>
                <label htmlFor="linked_inspection" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link to Existing Inspection (Optional)
                </label>
                <select
                  id="linked_inspection"
                  value={linkedInspectionId || ''}
                  onChange={(e) => {
                    const newInspectionId = e.target.value ? parseInt(e.target.value) : null;
                    setLinkedInspectionId(newInspectionId);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">None - Create new inspection if needed</option>
                  {availableInspections.length === 0 ? (
                    <option disabled>No inspections found - Check console for errors</option>
                  ) : (
                    availableInspections.map(inspection => (
                      <option key={inspection.id} value={inspection.id}>
                        {new Date(inspection.inspection_date).toLocaleDateString()} - {inspection.overall_condition.toUpperCase()}
                        {inspection.technician_notes && ` - ${inspection.technician_notes.substring(0, 50)}...`}
                        {inspection.is_linked && ` (Already linked to service #${inspection.linked_service_id})`}
                      </option>
                    ))
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Select an existing inspection to link to this service, or leave empty to create a new one if service includes inspection.
                  {linkedInspectionId && (
                    <span className="text-green-600 dark:text-green-400"> ✓ Vehicle inspection service will be automatically added to billing.</span>
                  )}
                  {availableInspections.filter(i => i.is_linked).length > 0 && (
                    <span className="text-blue-600 dark:text-blue-400"> Note: Some inspections are already linked to other services.</span>
                  )}
                </p>
              </div>
            )}

            {/* Technician Notes */}
            <div>
              <label htmlFor="technician_notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Technician Notes
              </label>
              <textarea
                id="technician_notes"
                value={formData.technician_notes}
                onChange={(e) => handleInputChange('technician_notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Additional notes from the technician"
              />
            </div>
            </div>
          </form>
        </div>
      </DialogContent>
      
      <DialogFooter className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              onClick={handleSubmit}
            >
              {submitLabel}
            </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ServiceRecordFormDialog;
