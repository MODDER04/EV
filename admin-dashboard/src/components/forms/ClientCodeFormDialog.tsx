import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '../ui/Dialog';
import { Button, Input } from '../ui';
import { ClientCode, ClientCodeFormData, Client } from '../../types';
import { generateClientCode } from '../../lib/utils';
import { Shuffle } from 'lucide-react';

interface ClientCodeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientCodeFormData) => Promise<void>;
  isLoading: boolean;
  title: string;
  submitLabel: string;
  initialData?: ClientCode;
  clients: Client[];
  initialCode?: string;
}

const ClientCodeFormDialog: React.FC<ClientCodeFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  title,
  submitLabel,
  initialData,
  clients,
  initialCode,
}) => {
  const [formData, setFormData] = useState<ClientCodeFormData>({
    code: '',
    client_id: undefined,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ClientCodeFormData, string>>>({});

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          code: initialData.code,
          client_id: initialData.client_id || undefined,
        });
      } else {
        setFormData({
          code: initialCode || '',
          client_id: undefined,
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData, initialCode]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClientCodeFormData, string>> = {};

    // Required field validation
    if (!formData.code || !formData.code.trim()) {
      newErrors.code = 'Code is required';
    } else if (formData.code.length < 4) {
      newErrors.code = 'Code must be at least 4 characters long';
    } else if (formData.code.length > 20) {
      newErrors.code = 'Code must be less than 20 characters';
    } else if (!/^[A-Z0-9]+$/.test(formData.code.toUpperCase())) {
      newErrors.code = 'Code can only contain letters and numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Clean up form data
    const cleanedData: ClientCodeFormData = {
      code: formData.code?.trim().toUpperCase() || '',
      client_id: formData.client_id || undefined,
    };

    try {
      await onSubmit(cleanedData);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleChange = (field: keyof ClientCodeFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = field === 'client_id' 
      ? parseInt(e.target.value) || undefined
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

  const handleGenerateCode = () => {
    const newCode = generateClientCode(6);
    setFormData(prev => ({
      ...prev,
      code: newCode,
    }));
    
    // Clear code error if it exists
    if (errors.code) {
      setErrors(prev => ({
        ...prev,
        code: undefined,
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Code <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={formData.code}
                  onChange={handleChange('code')}
                  error={errors.code}
                  placeholder="Enter code (e.g. ABC123)"
                  className="flex-1 font-mono uppercase"
                  maxLength={20}
                  disabled={isLoading}
                  style={{ textTransform: 'uppercase' }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateCode}
                  disabled={isLoading}
                  className="px-3"
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
              </div>
              {errors.code && (
                <p className="mt-2 text-sm text-red-600">{errors.code}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                4-20 characters, letters and numbers only
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Client
              </label>
              <select
                value={formData.client_id || ''}
                onChange={handleChange('client_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="">Leave unassigned</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.phone ? `(${client.phone})` : ''}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Optional - You can assign this code to a client later
              </p>
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

export default ClientCodeFormDialog;
