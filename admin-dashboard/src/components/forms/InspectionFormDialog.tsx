import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { InspectionReport, InspectionReportFormData, InspectionItemFormData, Vehicle } from '../../types';
import { Button, Input, Card } from '../ui';

interface InspectionFormDialogProps {
  inspection?: InspectionReport | null;
  onSave: (data: InspectionReportFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  vehicles: Vehicle[];
}


const defaultInspectionItems: InspectionItemFormData[] = [
  { item_name: 'Oil Level', status: 'good', notes: '' },
  { item_name: 'Brake Pads', status: 'good', notes: '' },
  { item_name: 'Tire Pressure', status: 'good', notes: '' },
  { item_name: 'Battery', status: 'good', notes: '' },
  { item_name: 'Lights (Headlights, Taillights)', status: 'good', notes: '' },
  { item_name: 'Windshield Wipers', status: 'good', notes: '' },
  { item_name: 'Air Filter', status: 'good', notes: '' },
  { item_name: 'Transmission Fluid', status: 'good', notes: '' },
];

const InspectionFormDialog: React.FC<InspectionFormDialogProps> = ({
  inspection,
  onSave,
  onCancel,
  isLoading,
  vehicles
}) => {
  const [formData, setFormData] = useState<InspectionReportFormData>({
    vehicle_id: 0,
    inspection_date: new Date().toISOString().split('T')[0],
    overall_condition: 'good',
    technician_notes: '',
    recommendations: '',
    items: defaultInspectionItems,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (inspection) {
      setFormData({
        vehicle_id: inspection.vehicle_id,
        inspection_date: inspection.inspection_date.split('T')[0],
        overall_condition: inspection.overall_status || 'good',
        technician_notes: inspection.notes || '',
        recommendations: '',
        items: inspection.items?.length ? inspection.items.map(item => ({
          item_name: item.item_name,
          status: item.status,
          notes: item.notes || '',
        })) : defaultInspectionItems,
      });
    }
  }, [inspection]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicle_id) {
      newErrors.vehicle_id = 'Please select a vehicle';
    }

    if (!formData.inspection_date) {
      newErrors.inspection_date = 'Inspection date is required';
    }

    if (!formData.overall_condition) {
      newErrors.overall_condition = 'Overall condition is required';
    }

    // Validate inspection items
    const hasEmptyItems = formData.items.some(item => !item.item_name.trim());
    if (hasEmptyItems) {
      newErrors.items = 'All inspection items must have names';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving inspection:', error);
    }
  };

  const handleItemChange = (index: number, field: keyof InspectionItemFormData, value: string) => {
    const updatedItems = formData.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addInspectionItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { item_name: '', status: 'good', notes: '' }]
    }));
  };

  const removeInspectionItem = (index: number) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: updatedItems }));
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

  // Auto-update overall condition based on items
  useEffect(() => {
    const getOverallCondition = () => {
      const replaceCount = formData.items.filter(item => item.status === 'replace').length;
      const needsAttentionCount = formData.items.filter(item => item.status === 'needs_attention').length;
      
      if (replaceCount > 0) return 'replace';
      if (needsAttentionCount > 0) return 'needs_attention';
      return 'good';
    };
    
    const overallCondition = getOverallCondition();
    setFormData(prev => ({ ...prev, overall_condition: overallCondition }));
  }, [formData.items]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {inspection ? 'Edit Inspection Report' : 'New Inspection Report'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vehicle *
              </label>
              <select
                value={formData.vehicle_id}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicle_id: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} - {vehicle.license_plate} ({vehicle.year})
                  </option>
                ))}
              </select>
              {errors.vehicle_id && (
                <p className="text-red-600 text-sm mt-1">{errors.vehicle_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Inspection Date *
              </label>
              <Input
                type="date"
                value={formData.inspection_date}
                onChange={(e) => setFormData(prev => ({ ...prev, inspection_date: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.inspection_date && (
                <p className="text-red-600 text-sm mt-1">{errors.inspection_date}</p>
              )}
            </div>
          </div>

          {/* Overall Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Overall Condition (Auto-calculated)
            </label>
            <div className="flex items-center space-x-3">
              {getStatusIcon(formData.overall_condition)}
              <span className="text-sm font-medium capitalize text-gray-900 dark:text-gray-100">
                {formData.overall_condition}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                (Based on inspection items below)
              </span>
            </div>
          </div>

          {/* Inspection Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Inspection Items
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addInspectionItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Item Name */}
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Item Name
                      </label>
                      <Input
                        value={item.item_name}
                        onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                        placeholder="e.g., Oil Level"
                      />
                    </div>

                    {/* Status */}
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        value={item.status}
                        onChange={(e) => handleItemChange(index, 'status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="good">Good</option>
                        <option value="needs_attention">Needs Attention</option>
                        <option value="replace">Replace</option>
                      </select>
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes
                      </label>
                      <Input
                        value={item.notes}
                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                        placeholder="Additional notes..."
                      />
                    </div>

                    {/* Remove Button */}
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-transparent mb-1">
                        Remove
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInspectionItem(index)}
                        disabled={formData.items.length <= 1}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {errors.items && (
              <p className="text-red-600 text-sm mt-1">{errors.items}</p>
            )}
          </div>

          {/* Notes and Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Technician Notes
              </label>
              <textarea
                value={formData.technician_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, technician_notes: e.target.value }))}
                rows={4}
                placeholder="Additional notes about the inspection..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recommendations
              </label>
              <textarea
                value={formData.recommendations}
                onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                rows={4}
                placeholder="Maintenance recommendations..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : inspection ? 'Update Inspection' : 'Create Inspection'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InspectionFormDialog;