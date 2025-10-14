import axios, { AxiosResponse } from 'axios';
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

// Configure axios defaults
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Health check
export const healthApi = {
  check: (): Promise<AxiosResponse<{ status: string; timestamp: string }>> =>
    apiClient.get('/health'),
};

// Dashboard API
export const dashboardApi = {
  getStats: (): Promise<AxiosResponse<DashboardStats>> =>
    apiClient.get('/admin/dashboard'),
};

// Clients API
export const clientsApi = {
  getAll: (): Promise<AxiosResponse<Client[]>> =>
    apiClient.get('/admin/clients'),
    
  getById: (id: number): Promise<AxiosResponse<Client>> =>
    apiClient.get(`/admin/clients/${id}`),
    
  create: (data: ClientFormData): Promise<AxiosResponse<Client>> =>
    apiClient.post('/admin/clients', data),
    
  update: (id: number, data: Partial<ClientFormData>): Promise<AxiosResponse<Client>> =>
    apiClient.put(`/admin/clients/${id}`, data),
    
  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/admin/clients/${id}`),
    
  deactivate: (id: number): Promise<AxiosResponse<Client>> =>
    apiClient.delete(`/admin/clients/${id}`), // Backend uses DELETE to deactivate
};

// Vehicles API
export const vehiclesApi = {
  getAll: (): Promise<AxiosResponse<Vehicle[]>> =>
    apiClient.get('/admin/vehicles'),
    
  getById: (id: number): Promise<AxiosResponse<Vehicle>> =>
    apiClient.get(`/admin/vehicles/${id}`),
    
  getByClientId: (clientId: number): Promise<AxiosResponse<Vehicle[]>> =>
    apiClient.get(`/admin/vehicles?client_id=${clientId}`),
    
  create: (data: VehicleFormData): Promise<AxiosResponse<Vehicle>> =>
    apiClient.post('/admin/vehicles', data),
    
  update: (id: number, data: Partial<VehicleFormData>): Promise<AxiosResponse<Vehicle>> =>
    apiClient.put(`/admin/vehicles/${id}`, data),
    
  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/admin/vehicles/${id}`),
};

// Client Codes API
export const clientCodesApi = {
  getAll: (): Promise<AxiosResponse<ClientCode[]>> =>
    apiClient.get('/admin/client-codes'),
    
  getById: (id: number): Promise<AxiosResponse<ClientCode>> =>
    apiClient.get(`/admin/client-codes/${id}`),
    
  create: (data: ClientCodeFormData): Promise<AxiosResponse<ClientCode>> =>
    apiClient.post('/admin/client-codes', data),
    
  update: (id: number, data: Partial<ClientCodeFormData>): Promise<AxiosResponse<ClientCode>> =>
    apiClient.put(`/admin/client-codes/${id}`, data),
    
  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/admin/client-codes/${id}`),
    
  toggle: (id: number): Promise<AxiosResponse<ClientCode>> =>
    apiClient.put(`/admin/client-codes/${id}/toggle`),
    
  generateCode: (length?: number): Promise<AxiosResponse<{ code: string }>> =>
    apiClient.post('/admin/generate-code', { length }),
};

// Service Records API
export const serviceRecordsApi = {
  getAll: (): Promise<AxiosResponse<ServiceRecord[]>> =>
    apiClient.get('/admin/service-records'),
    
  getById: (id: number): Promise<AxiosResponse<ServiceRecord>> =>
    apiClient.get(`/admin/service-records/${id}`),
    
  getByVehicleId: (vehicleId: number): Promise<AxiosResponse<ServiceRecord[]>> =>
    apiClient.get(`/admin/service-records?vehicle_id=${vehicleId}`),
    
  create: (data: ServiceRecordFormData): Promise<AxiosResponse<ServiceRecord>> =>
    apiClient.post('/admin/service-records', data),
    
  update: (id: number, data: Partial<ServiceRecordFormData>): Promise<AxiosResponse<ServiceRecord>> =>
    apiClient.put(`/admin/service-records/${id}`, data),
    
  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/admin/service-records/${id}`),
};

// Inspections API
export const inspectionsApi = {
  getAll: (): Promise<AxiosResponse<InspectionReport[]>> =>
    apiClient.get('/admin/inspections'),
    
  getById: (id: number): Promise<AxiosResponse<InspectionReport>> =>
    apiClient.get(`/admin/inspections/${id}`),
    
  getByVehicleId: (vehicleId: number): Promise<AxiosResponse<InspectionReport[]>> =>
    apiClient.get(`/admin/inspections?vehicle_id=${vehicleId}`),
    
  create: (data: InspectionReportFormData): Promise<AxiosResponse<InspectionReport>> =>
    apiClient.post('/admin/inspections', data),
    
  update: (id: number, data: Partial<InspectionReportFormData>): Promise<AxiosResponse<InspectionReport>> =>
    apiClient.put(`/admin/inspections/${id}`, data),
    
  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/admin/inspections/${id}`),
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Generic API call wrapper
export const apiCall = async <T>(
  apiFunction: () => Promise<AxiosResponse<T>>
): Promise<T> => {
  try {
    const response = await apiFunction();
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export default apiClient;
