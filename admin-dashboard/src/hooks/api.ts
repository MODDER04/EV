import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import {
  Client,
  ClientCode,
  Vehicle,
  ServiceRecord,
  InspectionReport,
  DashboardStats,
  ClientFormData,
  VehicleFormData,
  ClientCodeFormData,
  ServiceRecordFormData,
  InspectionReportFormData,
} from '../types';
import {
  healthApi,
  dashboardApi,
  clientsApi,
  vehiclesApi,
  clientCodesApi,
  serviceRecordsApi,
  inspectionsApi,
  apiCall,
} from '../lib/api';

// Query Keys
export const queryKeys = {
  health: ['health'] as const,
  dashboard: ['dashboard'] as const,
  clients: ['clients'] as const,
  client: (id: number) => ['clients', id] as const,
  vehicles: ['vehicles'] as const,
  vehicle: (id: number) => ['vehicles', id] as const,
  vehiclesByClient: (clientId: number) => ['vehicles', 'client', clientId] as const,
  clientCodes: ['client-codes'] as const,
  clientCode: (id: number) => ['client-codes', id] as const,
  serviceRecords: ['service-records'] as const,
  serviceRecord: (id: number) => ['service-records', id] as const,
  serviceRecordsByVehicle: (vehicleId: number) => ['service-records', 'vehicle', vehicleId] as const,
  inspections: ['inspections'] as const,
  inspection: (id: number) => ['inspections', id] as const,
  inspectionsByVehicle: (vehicleId: number) => ['inspections', 'vehicle', vehicleId] as const,
};

// Health API hooks
export const useHealthCheck = (options?: UseQueryOptions<{ status: string; timestamp: string }>) => {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiCall(healthApi.check),
    refetchInterval: 30000, // Check health every 30 seconds
    ...options,
  });
};

// Dashboard API hooks
export const useDashboardStats = (options?: UseQueryOptions<DashboardStats>) => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => apiCall(dashboardApi.getStats),
    refetchInterval: 60000, // Refresh stats every minute
    ...options,
  });
};

// Clients API hooks
export const useClients = (options?: UseQueryOptions<Client[]>) => {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: () => apiCall(clientsApi.getAll),
    ...options,
  });
};

export const useClient = (id: number, options?: UseQueryOptions<Client>) => {
  return useQuery({
    queryKey: queryKeys.client(id),
    queryFn: () => apiCall(() => clientsApi.getById(id)),
    enabled: !!id,
    ...options,
  });
};

export const useCreateClient = (options?: UseMutationOptions<Client, Error, ClientFormData>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ClientFormData) => apiCall(() => clientsApi.create(data)),
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      console.error('Failed to create client:', error);
    },
    ...options,
  });
};

export const useUpdateClient = (options?: UseMutationOptions<Client, Error, { id: number; data: Partial<ClientFormData> }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => apiCall(() => clientsApi.update(id, data)),
    onSuccess: (updatedClient, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
      queryClient.invalidateQueries({ queryKey: queryKeys.client(id) });
    },
    ...options,
  });
};

export const useDeleteClient = (options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiCall(() => clientsApi.delete(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.removeQueries({ queryKey: queryKeys.client(id) });
    },
    ...options,
  });
};

// Vehicles API hooks
export const useVehicles = (options?: UseQueryOptions<Vehicle[]>) => {
  return useQuery({
    queryKey: queryKeys.vehicles,
    queryFn: () => apiCall(vehiclesApi.getAll),
    ...options,
  });
};

export const useVehicle = (id: number, options?: UseQueryOptions<Vehicle>) => {
  return useQuery({
    queryKey: queryKeys.vehicle(id),
    queryFn: () => apiCall(() => vehiclesApi.getById(id)),
    enabled: !!id,
    ...options,
  });
};

export const useVehiclesByClient = (clientId: number, options?: UseQueryOptions<Vehicle[]>) => {
  return useQuery({
    queryKey: queryKeys.vehiclesByClient(clientId),
    queryFn: () => apiCall(() => vehiclesApi.getByClientId(clientId)),
    enabled: !!clientId,
    ...options,
  });
};

export const useCreateVehicle = (options?: UseMutationOptions<Vehicle, Error, VehicleFormData>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: VehicleFormData) => apiCall(() => vehiclesApi.create(data)),
    onSuccess: (newVehicle) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehiclesByClient(newVehicle.client_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    ...options,
  });
};

export const useUpdateVehicle = (options?: UseMutationOptions<Vehicle, Error, { id: number; data: Partial<VehicleFormData> }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => apiCall(() => vehiclesApi.update(id, data)),
    onSuccess: (updatedVehicle, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicle(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehiclesByClient(updatedVehicle.client_id) });
    },
    ...options,
  });
};

export const useDeleteVehicle = (options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiCall(() => vehiclesApi.delete(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.removeQueries({ queryKey: queryKeys.vehicle(id) });
    },
    ...options,
  });
};

// Client Codes API hooks
export const useClientCodes = (options?: UseQueryOptions<ClientCode[]>) => {
  return useQuery({
    queryKey: queryKeys.clientCodes,
    queryFn: () => apiCall(clientCodesApi.getAll),
    ...options,
  });
};

export const useClientCode = (id: number, options?: UseQueryOptions<ClientCode>) => {
  return useQuery({
    queryKey: queryKeys.clientCode(id),
    queryFn: () => apiCall(() => clientCodesApi.getById(id)),
    enabled: !!id,
    ...options,
  });
};

export const useCreateClientCode = (options?: UseMutationOptions<ClientCode, Error, ClientCodeFormData>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ClientCodeFormData) => apiCall(() => clientCodesApi.create(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clientCodes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    ...options,
  });
};

export const useUpdateClientCode = (options?: UseMutationOptions<ClientCode, Error, { id: number; data: Partial<ClientCodeFormData> }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => apiCall(() => clientCodesApi.update(id, data)),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clientCodes });
      queryClient.invalidateQueries({ queryKey: queryKeys.clientCode(id) });
    },
    ...options,
  });
};

export const useToggleClientCode = (options?: UseMutationOptions<ClientCode, Error, number>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiCall(() => clientCodesApi.toggle(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clientCodes });
      queryClient.invalidateQueries({ queryKey: queryKeys.clientCode(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    ...options,
  });
};

export const useDeleteClientCode = (options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiCall(() => clientCodesApi.delete(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clientCodes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.removeQueries({ queryKey: queryKeys.clientCode(id) });
    },
    ...options,
  });
};

export const useGenerateCode = (options?: UseMutationOptions<{ code: string }, Error, number | undefined>) => {
  return useMutation({
    mutationFn: (length?: number) => apiCall(() => clientCodesApi.generateCode(length)),
    ...options,
  });
};

// Service Records API hooks
export const useServiceRecords = (options?: UseQueryOptions<ServiceRecord[]>) => {
  return useQuery({
    queryKey: queryKeys.serviceRecords,
    queryFn: () => apiCall(serviceRecordsApi.getAll),
    ...options,
  });
};

export const useServiceRecord = (id: number, options?: UseQueryOptions<ServiceRecord>) => {
  return useQuery({
    queryKey: queryKeys.serviceRecord(id),
    queryFn: () => apiCall(() => serviceRecordsApi.getById(id)),
    enabled: !!id,
    ...options,
  });
};

export const useServiceRecordsByVehicle = (vehicleId: number, options?: UseQueryOptions<ServiceRecord[]>) => {
  return useQuery({
    queryKey: queryKeys.serviceRecordsByVehicle(vehicleId),
    queryFn: () => apiCall(() => serviceRecordsApi.getByVehicleId(vehicleId)),
    enabled: !!vehicleId,
    ...options,
  });
};

export const useCreateServiceRecord = (options?: UseMutationOptions<ServiceRecord, Error, ServiceRecordFormData>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ServiceRecordFormData) => apiCall(() => serviceRecordsApi.create(data)),
    onSuccess: (newRecord) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRecords });
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRecordsByVehicle(newRecord.vehicle_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    ...options,
  });
};

export const useUpdateServiceRecord = (options?: UseMutationOptions<ServiceRecord, Error, { id: number; data: Partial<ServiceRecordFormData> }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => apiCall(() => serviceRecordsApi.update(id, data)),
    onSuccess: (updatedRecord, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRecords });
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRecord(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRecordsByVehicle(updatedRecord.vehicle_id) });
    },
    ...options,
  });
};

export const useDeleteServiceRecord = (options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiCall(() => serviceRecordsApi.delete(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRecords });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.removeQueries({ queryKey: queryKeys.serviceRecord(id) });
    },
    ...options,
  });
};

// Inspections API hooks
export const useInspections = (options?: UseQueryOptions<InspectionReport[]>) => {
  return useQuery({
    queryKey: queryKeys.inspections,
    queryFn: () => apiCall(inspectionsApi.getAll),
    ...options,
  });
};

export const useInspection = (id: number, options?: UseQueryOptions<InspectionReport>) => {
  return useQuery({
    queryKey: queryKeys.inspection(id),
    queryFn: () => apiCall(() => inspectionsApi.getById(id)),
    enabled: !!id,
    ...options,
  });
};

export const useInspectionsByVehicle = (vehicleId: number, options?: UseQueryOptions<InspectionReport[]>) => {
  return useQuery({
    queryKey: queryKeys.inspectionsByVehicle(vehicleId),
    queryFn: () => apiCall(() => inspectionsApi.getByVehicleId(vehicleId)),
    enabled: !!vehicleId,
    ...options,
  });
};

export const useCreateInspection = (options?: UseMutationOptions<InspectionReport, Error, InspectionReportFormData>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InspectionReportFormData) => apiCall(() => inspectionsApi.create(data)),
    onSuccess: (newInspection) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inspections });
      queryClient.invalidateQueries({ queryKey: queryKeys.inspectionsByVehicle(newInspection.vehicle_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    ...options,
  });
};

export const useUpdateInspection = (options?: UseMutationOptions<InspectionReport, Error, { id: number; data: Partial<InspectionReportFormData> }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => apiCall(() => inspectionsApi.update(id, data)),
    onSuccess: (updatedInspection, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inspections });
      queryClient.invalidateQueries({ queryKey: queryKeys.inspection(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.inspectionsByVehicle(updatedInspection.vehicle_id) });
    },
    ...options,
  });
};

export const useDeleteInspection = (options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiCall(() => inspectionsApi.delete(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inspections });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.removeQueries({ queryKey: queryKeys.inspection(id) });
    },
    ...options,
  });
};
