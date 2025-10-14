import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '../ui/Dialog';
import { Button, Input } from '../ui';
import { Vehicle, VehicleFormData, Client } from '../../types';
import { isValidVIN } from '../../lib/utils';

interface VehicleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  isLoading: boolean;
  title: string;
  submitLabel: string;
  initialData?: Vehicle;
  clients: Client[];
}

const VehicleFormDialog: React.FC<VehicleFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  title,
  submitLabel,
  initialData,
  clients,
}) => {
  const [formData, setFormData] = useState<VehicleFormData>({
    client_id: 0,
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    license_plate: '',
    color: '',
    mileage: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof VehicleFormData, string>>>({});

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          client_id: initialData.client_id,
          make: initialData.make,
          model: initialData.model,
          year: initialData.year,
          vin: initialData.vin || '',
          license_plate: initialData.license_plate || '',
          color: initialData.color || '',
          mileage: initialData.mileage || 0,
        });
      } else {
        setFormData({
          client_id: 0,
          make: '',
          model: '',
          year: new Date().getFullYear(),
          vin: '',
          license_plate: '',
          color: '',
          mileage: 0,
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof VehicleFormData, string>> = {};

    // Required field validation
    if (!formData.client_id || formData.client_id === 0) {
      newErrors.client_id = 'Please select a client';
    }
    
    if (!formData.make.trim()) {
      newErrors.make = 'Make is required';
    }
    
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }
    
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Please enter a valid year';
    }

    // VIN validation (if provided)
    if (formData.vin && !isValidVIN(formData.vin)) {
      newErrors.vin = 'Please enter a valid 17-character VIN';
    }

    // Mileage validation (if provided)
    if (formData.mileage && (formData.mileage < 0 || formData.mileage > 999999)) {
      newErrors.mileage = 'Please enter a valid mileage (0-999,999)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Clean up form data - remove empty strings for optional fields
    const cleanedData: VehicleFormData = {
      client_id: formData.client_id,
      make: formData.make.trim(),
      model: formData.model.trim(),
      year: formData.year,
      vin: formData.vin?.trim() || undefined,
      license_plate: formData.license_plate?.trim() || undefined,
      color: formData.color?.trim() || undefined,
      mileage: formData.mileage || undefined,
    };

    try {
      await onSubmit(cleanedData);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleChange = (field: keyof VehicleFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = field === 'client_id' || field === 'year' || field === 'mileage' 
      ? parseInt(e.target.value) || 0 
      : e.target.value;
      
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <form onSubmit={handleSubmit}>
        <DialogHeader onClose={onClose}>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <DialogContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.client_id}
                onChange={handleChange('client_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                <option value={0}>Select a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.phone ? `(${client.phone})` : ''}
                  </option>
                ))}
              </select>
              {errors.client_id && (
                <p className="mt-2 text-sm text-red-600">{errors.client_id}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Make"
                type="text"
                value={formData.make}
                onChange={handleChange('make')}
                error={errors.make}
                placeholder="e.g. Toyota, Ford"
                required
                disabled={isLoading}
              />

              <Input
                label="Model"
                type="text"
                value={formData.model}
                onChange={handleChange('model')}
                error={errors.model}
                placeholder="e.g. Camry, F-150"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Year"
                type="number"
                value={formData.year}
                onChange={handleChange('year')}
                error={errors.year}
                placeholder="2023"
                min={1900}
                max={new Date().getFullYear() + 1}
                required
                disabled={isLoading}
              />

              <Input
                label="Color"
                type="text"
                value={formData.color}
                onChange={handleChange('color')}
                error={errors.color}
                placeholder="e.g. Red, Blue, Silver"
                helperText="Optional"
                disabled={isLoading}
              />
            </div>

            <Input
              label="License Plate"
              type="text"
              value={formData.license_plate}
              onChange={handleChange('license_plate')}
              error={errors.license_plate}
              placeholder="e.g. ABC-1234"
              helperText="Optional"
              disabled={isLoading}
            />

            <Input
              label="VIN"
              type="text"
              value={formData.vin}
              onChange={handleChange('vin')}
              error={errors.vin}
              placeholder="17-character Vehicle Identification Number"
              helperText="Optional - Must be 17 characters if provided"
              maxLength={17}
              disabled={isLoading}
            />

            <Input
              label="Mileage"
              type="number"
              value={formData.mileage || ''}
              onChange={handleChange('mileage')}
              error={errors.mileage}
              placeholder="Current mileage"
              helperText="Optional - Current vehicle mileage"
              min={0}
              max={999999}
              disabled={isLoading}
            />
          </div>
        </DialogContent>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={isLoading}
            disabled={isLoading}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export default VehicleFormDialog;