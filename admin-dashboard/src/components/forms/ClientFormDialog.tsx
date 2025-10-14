import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '../ui/Dialog';
import { Button, Input } from '../ui';
import { Client, ClientFormData } from '../../types';
import { isValidEmail, isValidPhone } from '../../lib/utils';

interface ClientFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<void>;
  isLoading: boolean;
  title: string;
  submitLabel: string;
  initialData?: Client;
}

const ClientFormDialog: React.FC<ClientFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  title,
  submitLabel,
  initialData,
}) => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({});

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          phone: initialData.phone || '',
          email: initialData.email || '',
          address: initialData.address || '',
        });
      } else {
        setFormData({
          name: '',
          phone: '',
          email: '',
          address: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClientFormData, string>> = {};

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation (if provided)
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (if provided)
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
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
    const cleanedData: ClientFormData = {
      name: formData.name.trim(),
      phone: formData.phone?.trim() || undefined,
      email: formData.email?.trim() || undefined,
      address: formData.address?.trim() || undefined,
    };

    try {
      await onSubmit(cleanedData);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleChange = (field: keyof ClientFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
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
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-md">
      <form onSubmit={handleSubmit}>
        <DialogHeader onClose={onClose}>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <DialogContent>
          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={handleChange('name')}
              error={errors.name}
              placeholder="Enter client's full name"
              required
              disabled={isLoading}
            />

            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              error={errors.phone}
              placeholder="(555) 123-4567"
              helperText="Optional - Enter a valid phone number"
              disabled={isLoading}
            />

            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={errors.email}
              placeholder="client@example.com"
              helperText="Optional - Enter a valid email address"
              disabled={isLoading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={handleChange('address')}
                placeholder="Enter client's address (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
                disabled={isLoading}
              />
            </div>
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

export default ClientFormDialog;