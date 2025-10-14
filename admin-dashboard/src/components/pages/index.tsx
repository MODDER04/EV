import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  Car,
  KeyRound,
  Edit, 
  Trash2, 
  Phone, 
  Mail,
  Shuffle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  ClipboardList
} from 'lucide-react';
import {
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Input, 
  Badge, 
  EmptyState, 
  Avatar, 
  LoadingSpinner 
} from '../ui';
import { ConfirmDialog } from '../ui/Dialog';
import { useToastHelpers } from '../ui/Toast';
import {
  useClients, 
  useCreateClient, 
  useUpdateClient, 
  useDeleteClient,
  useVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
  useClientCodes,
  useCreateClientCode,
  useUpdateClientCode,
  useDeleteClientCode,
  useToggleClientCode,
  useGenerateCode,
  useServiceRecords,
  useCreateServiceRecord,
  useUpdateServiceRecord,
  useDeleteServiceRecord
} from '../../hooks/api';
import { 
  Client, 
  ClientFormData,
  Vehicle,
  VehicleFormData,
  ClientCode,
  ClientCodeFormData,
  ServiceRecord,
  ServiceRecordFormData
} from '../../types';
import { 
  formatDate, 
  formatDateTime,
  formatPhone, 
  formatMileage,
  formatCurrency,
  truncateText, 
  getErrorMessage 
} from '../../lib/utils';
import ClientFormDialog from '../forms/ClientFormDialog';
import VehicleFormDialog from '../forms/VehicleFormDialog';
import ClientCodeFormDialog from '../forms/ClientCodeFormDialog';
import ServiceRecordFormDialog from '../forms/ServiceRecordFormDialog';

// Placeholder components for now - these will be expanded later

export const ClientsManager: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: clients, isLoading, error } = useClients();
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();
  const generateCodeMutation = useGenerateCode();
  const createCodeMutation = useCreateClientCode();
  const { success, error: showError } = useToastHelpers();

  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone && client.phone.includes(searchTerm)) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleCreateClient = async (data: ClientFormData) => {
    try {
      await createClientMutation.mutateAsync(data);
      success('Client created', 'New client has been added successfully.');
      setShowCreateForm(false);
    } catch (error) {
      showError('Failed to create client', getErrorMessage(error));
    }
  };

  const handleUpdateClient = async (data: Partial<ClientFormData>) => {
    if (!editingClient) return;
    
    try {
      await updateClientMutation.mutateAsync({ id: editingClient.id, data });
      success('Client updated', 'Client information has been updated successfully.');
      setEditingClient(null);
    } catch (error) {
      showError('Failed to update client', getErrorMessage(error));
    }
  };

  const handleDeleteClient = async () => {
    if (!deletingClient) return;
    
    try {
      await deleteClientMutation.mutateAsync(deletingClient.id);
      success('Client deleted', 'Client has been deactivated successfully.');
      setDeletingClient(null);
    } catch (error) {
      showError('Failed to delete client', getErrorMessage(error));
    }
  };

  const handleGenerateCodeForClient = async (client: Client) => {
    try {
      // Generate a new code
      const generatedResult = await generateCodeMutation.mutateAsync(6);
      
      // Create and assign the code to the client
      await createCodeMutation.mutateAsync({
        code: generatedResult.code,
        client_id: client.id,
      });
      
      success(
        'Code generated and assigned', 
        `Access code "${generatedResult.code}" has been generated and assigned to ${client.name}.`
      );
    } catch (error) {
      showError('Failed to generate code', getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Client Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage client accounts and information</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-600">Manage client accounts and information</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Failed to load clients</h3>
            <p className="text-gray-600 dark:text-gray-400">Please check if the backend server is running.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Client Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage client accounts and information</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search clients by name, phone, or email..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <Badge variant="info">
              {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Clients ({filteredClients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <EmptyState
              title="No clients found"
              description="Get started by adding your first client"
              icon={<Users className="h-12 w-12" />}
              action={
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Client
                </Button>
              }
            />
          ) : (
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar fallback={client.name.charAt(0)} className="h-8 w-8 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{client.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">ID: {client.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {client.phone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {formatPhone(client.phone)}
                            </div>
                          )}
                          {client.email && (
                            <div className="flex items-center mt-1">
                              <Mail className="h-3 w-3 mr-1" />
                              {client.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {client.address ? truncateText(client.address, 40) : '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={client.is_active ? 'success' : 'danger'}>
                          {client.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(client.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateCodeForClient(client)}
                            loading={generateCodeMutation.isPending || createCodeMutation.isPending}
                            title="Generate access code"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingClient(client)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingClient(client)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Client Dialog */}
      <ClientFormDialog
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateClient}
        isLoading={createClientMutation.isPending}
        title="Add New Client"
        submitLabel="Create Client"
      />

      {/* Edit Client Dialog */}
      <ClientFormDialog
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        onSubmit={handleUpdateClient}
        isLoading={updateClientMutation.isPending}
        title="Edit Client"
        submitLabel="Update Client"
        initialData={editingClient || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={handleDeleteClient}
        title="Delete Client"
        description={`Are you sure you want to delete "${deletingClient?.name}"? This action will deactivate the client account.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteClientMutation.isPending}
      />
    </div>
  );
};

export const VehiclesManager: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: vehicles, isLoading, error } = useVehicles();
  const { data: clients } = useClients();
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();
  const { success, error: showError } = useToastHelpers();

  const filteredVehicles = vehicles?.filter(vehicle => 
    `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vehicle.license_plate && vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (vehicle.vin && vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (vehicle.client?.name && vehicle.client.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleCreateVehicle = async (data: VehicleFormData) => {
    try {
      await createVehicleMutation.mutateAsync(data);
      success('Vehicle created', 'New vehicle has been added successfully.');
      setShowCreateForm(false);
    } catch (error) {
      showError('Failed to create vehicle', getErrorMessage(error));
    }
  };

  const handleUpdateVehicle = async (data: Partial<VehicleFormData>) => {
    if (!editingVehicle) return;
    
    try {
      await updateVehicleMutation.mutateAsync({ id: editingVehicle.id, data });
      success('Vehicle updated', 'Vehicle information has been updated successfully.');
      setEditingVehicle(null);
    } catch (error) {
      showError('Failed to update vehicle', getErrorMessage(error));
    }
  };

  const handleDeleteVehicle = async () => {
    if (!deletingVehicle) return;
    
    try {
      await deleteVehicleMutation.mutateAsync(deletingVehicle.id);
      success('Vehicle deleted', 'Vehicle has been removed successfully.');
      setDeletingVehicle(null);
    } catch (error) {
      showError('Failed to delete vehicle', getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
            <p className="text-gray-600">Manage vehicle records and information</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
            <p className="text-gray-600">Manage vehicle records and information</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load vehicles</h3>
              <p className="text-gray-600">Please check if the backend server is running.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Vehicle Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage vehicle records and information</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search vehicles by make, model, plate, VIN, or client..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <Badge variant="info">
              {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicles ({filteredVehicles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVehicles.length === 0 ? (
            <EmptyState
              title="No vehicles found"
              description="Get started by adding the first vehicle"
              icon={<Car className="h-12 w-12" />}
              action={
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Vehicle
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Identifiers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Added
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3">
                            <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">ID: {vehicle.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {vehicle.client?.name || 'Unknown'}
                        </div>
                        {vehicle.client?.phone && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatPhone(vehicle.client.phone)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {vehicle.license_plate && (
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                {vehicle.license_plate}
                              </span>
                            </div>
                          )}
                          {vehicle.vin && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              VIN: {truncateText(vehicle.vin, 10)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {vehicle.color && (
                            <div className="flex items-center">
                              <span className="text-gray-500 dark:text-gray-400">Color:</span>
                              <span className="ml-1">{vehicle.color}</span>
                            </div>
                          )}
                          {vehicle.mileage && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatMileage(vehicle.mileage)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(vehicle.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingVehicle(vehicle)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingVehicle(vehicle)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Vehicle Dialog */}
      <VehicleFormDialog
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateVehicle}
        isLoading={createVehicleMutation.isPending}
        title="Add New Vehicle"
        submitLabel="Create Vehicle"
        clients={clients || []}
      />

      {/* Edit Vehicle Dialog */}
      <VehicleFormDialog
        isOpen={!!editingVehicle}
        onClose={() => setEditingVehicle(null)}
        onSubmit={handleUpdateVehicle}
        isLoading={updateVehicleMutation.isPending}
        title="Edit Vehicle"
        submitLabel="Update Vehicle"
        initialData={editingVehicle || undefined}
        clients={clients || []}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingVehicle}
        onClose={() => setDeletingVehicle(null)}
        onConfirm={handleDeleteVehicle}
        title="Delete Vehicle"
        description={`Are you sure you want to delete "${deletingVehicle?.year} ${deletingVehicle?.make} ${deletingVehicle?.model}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteVehicleMutation.isPending}
      />
    </div>
  );
};

export const CodesManager: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCode, setEditingCode] = useState<ClientCode | null>(null);
  const [deletingCode, setDeletingCode] = useState<ClientCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [generatedCode, setGeneratedCode] = useState('');
  
  const { data: codes, isLoading, error } = useClientCodes();
  const { data: clients } = useClients();
  const createCodeMutation = useCreateClientCode();
  const updateCodeMutation = useUpdateClientCode();
  const deleteCodeMutation = useDeleteClientCode();
  const toggleCodeMutation = useToggleClientCode();
  const generateCodeMutation = useGenerateCode();
  const { success, error: showError } = useToastHelpers();

  const filteredCodes = codes?.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (code.client?.name && code.client.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && code.is_active) ||
      (statusFilter === 'inactive' && !code.is_active);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleCreateCode = async (data: ClientCodeFormData) => {
    try {
      await createCodeMutation.mutateAsync(data);
      success('Client code created', 'New client access code has been created successfully.');
      setShowCreateForm(false);
      setGeneratedCode('');
    } catch (error) {
      showError('Failed to create code', getErrorMessage(error));
    }
  };

  const handleUpdateCode = async (data: Partial<ClientCodeFormData>) => {
    if (!editingCode) return;
    
    try {
      await updateCodeMutation.mutateAsync({ id: editingCode.id, data });
      success('Code updated', 'Client code has been updated successfully.');
      setEditingCode(null);
    } catch (error) {
      showError('Failed to update code', getErrorMessage(error));
    }
  };

  const handleToggleCode = async (code: ClientCode) => {
    try {
      await toggleCodeMutation.mutateAsync(code.id);
      success(
        code.is_active ? 'Code deactivated' : 'Code activated', 
        `Client code has been ${code.is_active ? 'deactivated' : 'activated'} successfully.`
      );
    } catch (error) {
      showError('Failed to toggle code', getErrorMessage(error));
    }
  };

  const handleDeleteCode = async () => {
    if (!deletingCode) return;
    
    try {
      await deleteCodeMutation.mutateAsync(deletingCode.id);
      success('Code deleted', 'Client code has been permanently deleted.');
      setDeletingCode(null);
    } catch (error) {
      showError('Failed to delete code', getErrorMessage(error));
    }
  };

  const handleGenerateCode = async () => {
    try {
      const result = await generateCodeMutation.mutateAsync(6);
      setGeneratedCode(result.code);
      success('Code generated', 'New code generated successfully. You can now assign it to a client.');
    } catch (error) {
      showError('Failed to generate code', getErrorMessage(error));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    success('Copied', 'Code copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Code Management</h1>
            <p className="text-gray-600">Generate and manage client access codes</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Code Management</h1>
            <p className="text-gray-600">Generate and manage client access codes</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load codes</h3>
              <p className="text-gray-600">Please check if the backend server is running.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Client Code Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Generate and manage client access codes</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleGenerateCode} loading={generateCodeMutation.isPending}>
            <Shuffle className="h-4 w-4 mr-2" />
            Quick Generate
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Code
          </Button>
        </div>
      </div>

      {/* Generated Code Alert */}
      {generatedCode && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-1 bg-green-100 rounded-full mr-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-green-800">New Code Generated</h4>
                  <p className="text-sm text-green-700">
                    Generated code: <span className="font-mono font-bold">{generatedCode}</span>
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(generatedCode)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(true);
                  }}
                >
                  Assign to Client
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search codes or client names..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <Badge variant="info">
              {filteredCodes.length} code{filteredCodes.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client Codes ({filteredCodes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCodes.length === 0 ? (
            <EmptyState
              title="No codes found"
              description="Generate your first client access code"
              icon={<KeyRound className="h-12 w-12" />}
              action={
                <div className="space-x-2">
                  <Button variant="outline" onClick={handleGenerateCode}>
                    <Shuffle className="h-4 w-4 mr-2" />
                    Generate Code
                  </Button>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Code
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Assigned Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Used
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg mr-3">
                            <KeyRound className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <div className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">{code.code}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">ID: {code.id}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(code.code)}
                            className="ml-2 h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {code.client ? (
                            <div>
                              <div className="font-medium">{code.client.name}</div>
                              {code.client.phone && (
                                <div className="text-gray-500 dark:text-gray-400">
                                  {formatPhone(code.client.phone)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 italic">Unassigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Badge variant={code.is_active ? 'success' : 'danger'}>
                            {code.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(code.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {code.used_at ? formatDateTime(code.used_at) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleCode(code)}
                            disabled={toggleCodeMutation.isPending}
                          >
                            {code.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCode(code)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingCode(code)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Code Dialog */}
      <ClientCodeFormDialog
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setGeneratedCode('');
        }}
        onSubmit={handleCreateCode}
        isLoading={createCodeMutation.isPending}
        title="Add New Client Code"
        submitLabel="Create Code"
        clients={clients || []}
        initialCode={generatedCode}
      />

      {/* Edit Code Dialog */}
      <ClientCodeFormDialog
        isOpen={!!editingCode}
        onClose={() => setEditingCode(null)}
        onSubmit={handleUpdateCode}
        isLoading={updateCodeMutation.isPending}
        title="Edit Client Code"
        submitLabel="Update Code"
        initialData={editingCode || undefined}
        clients={clients || []}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCode}
        onClose={() => setDeletingCode(null)}
        onConfirm={handleDeleteCode}
        title="Delete Client Code"
        description={`Are you sure you want to permanently delete code "${deletingCode?.code}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteCodeMutation.isPending}
      />
    </div>
  );
};

export const ServiceRecordsManager: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<ServiceRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  
  const { data: serviceRecords, isLoading, error } = useServiceRecords();
  const { data: vehicles } = useVehicles();
  const createRecordMutation = useCreateServiceRecord();
  const updateRecordMutation = useUpdateServiceRecord();
  const deleteRecordMutation = useDeleteServiceRecord();
  const { success, error: showError } = useToastHelpers();

  const filteredRecords = serviceRecords?.filter(record => {
    const serviceNames = record.service_items?.map(item => item.service_name).join(' ') || '';
    const serviceDescriptions = record.service_items?.map(item => item.description).join(' ') || '';
    
    const matchesSearch = serviceNames.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceDescriptions.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.technician_notes && record.technician_notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.vehicle?.make && `${record.vehicle.make} ${record.vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesVehicle = !selectedVehicle || record.vehicle_id === selectedVehicle;
    
    return matchesSearch && matchesVehicle;
  }) || [];

  const handleCreateRecord = async (data: ServiceRecordFormData) => {
    try {
      // Convert date from YYYY-MM-DD to ISO datetime format
      let isoDate;
      try {
        const date = new Date(data.service_date + 'T00:00:00.000Z');
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        isoDate = date.toISOString();
      } catch (dateError) {
        // Fallback to current date if date parsing fails
        isoDate = new Date().toISOString();
      }
      
      const recordData = {
        ...data,
        service_date: isoDate
      };
      await createRecordMutation.mutateAsync(recordData);
      success('Service record created', 'New service record has been added successfully.');
      setShowCreateForm(false);
    } catch (error) {
      showError('Failed to create service record', getErrorMessage(error));
    }
  };

  const handleUpdateRecord = async (data: Partial<ServiceRecordFormData>) => {
    if (!editingRecord) return;
    
    try {
      // Convert date from YYYY-MM-DD to ISO datetime format if service_date is provided
      const recordData = { ...data };
      
      if (data.service_date) {
        try {
          const date = new Date(data.service_date + 'T00:00:00.000Z');
          if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
          }
          recordData.service_date = date.toISOString();
        } catch (dateError) {
          // Keep original date if parsing fails
          recordData.service_date = editingRecord.service_date;
        }
      }
      
      await updateRecordMutation.mutateAsync({ id: editingRecord.id, data: recordData });
      success('Service record updated', 'Service record has been updated successfully.');
      setEditingRecord(null);
    } catch (error) {
      showError('Failed to update service record', getErrorMessage(error));
    }
  };

  const handleDeleteRecord = async () => {
    if (!deletingRecord) return;
    
    try {
      await deleteRecordMutation.mutateAsync(deletingRecord.id);
      success('Service record deleted', 'Service record has been deleted successfully.');
      setDeletingRecord(null);
    } catch (error) {
      showError('Failed to delete service record', getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Service Records</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage vehicle service history and records</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Service Records</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage vehicle service history and records</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Failed to load service records</h3>
              <p className="text-gray-600 dark:text-gray-400">Please check if the backend server is running.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Service Records</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage vehicle service history and records</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service Record
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by service type, description, or notes..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div>
              <select
                value={selectedVehicle || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedVehicle(parseInt(e.target.value) || null)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Vehicles</option>
                {vehicles?.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.license_plate}
                  </option>
                ))}
              </select>
            </div>
            <Badge variant="info">
              {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Service Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Records ({filteredRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <EmptyState
              title="No service records found"
              description="Get started by adding the first service record"
              icon={<ClipboardList className="h-12 w-12" />}
              action={
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Record
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Service Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3">
                            <Car className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {record.vehicle ? `${record.vehicle.year} ${record.vehicle.make} ${record.vehicle.model}` : 'Unknown Vehicle'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {record.vehicle?.license_plate && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                  {record.vehicle.license_plate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          <div className="font-medium">
                            {record.service_items && record.service_items.length > 0 ? (
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                                    {record.service_items.length} service{record.service_items.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="mt-1 text-gray-600 dark:text-gray-400">
                                  {record.service_items.map(item => item.service_name).join(', ')}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500 italic">No services</span>
                            )}
                          </div>
                          {record.technician_notes && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Notes: {truncateText(record.technician_notes, 30)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={record.status === 'completed' ? 'success' : record.status === 'in_progress' ? 'warning' : 'info'}>
                          {record.status === 'in_progress' ? 'In Progress' : record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(record.total_cost || 0)}
                        </div>
                        {record.service_items && record.service_items.length > 1 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {record.service_items.map((item, idx) => (
                              <div key={idx}>{item.service_name}: {formatCurrency(item.price)}</div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(record.service_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingRecord(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingRecord(record)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Service Record Dialog */}
      <ServiceRecordFormDialog
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateRecord}
        isLoading={createRecordMutation.isPending}
        title="Add New Service Record"
        submitLabel="Create Record"
        vehicles={vehicles || []}
      />

      {/* Edit Service Record Dialog */}
      <ServiceRecordFormDialog
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        onSubmit={handleUpdateRecord}
        isLoading={updateRecordMutation.isPending}
        title="Edit Service Record"
        submitLabel="Update Record"
        initialData={editingRecord || undefined}
        vehicles={vehicles || []}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingRecord}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleDeleteRecord}
        title="Delete Service Record"
        description={`Are you sure you want to delete this service record? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteRecordMutation.isPending}
      />
    </div>
  );
};

// Export InspectionsManager
export { default as InspectionsManager } from './InspectionsManager';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Application settings and configuration</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Application settings will be implemented here.</p>
          <p className="text-sm text-gray-500 mt-2">
            This will include system configuration, user preferences, and other settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

