// Database entity types
export interface Client {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ClientCode {
  id: number;
  code: string;
  client_id?: number;
  client?: Client;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  used_at?: string;
}

export interface Vehicle {
  id: number;
  client_id: number;
  client?: Client;
  make: string;
  model: string;
  year: number;
  vin?: string;
  license_plate?: string;
  color?: string;
  mileage?: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceItem {
  id: number;
  service_record_id: number;
  service_type: string;
  service_name: string;
  description?: string;
  price: number;
  created_at: string;
}

export interface ServiceRecord {
  id: number;
  vehicle_id: number;
  vehicle?: Vehicle;
  service_date: string;
  status: string;
  technician_notes?: string;
  total_cost: number;
  created_at: string;
  service_items: ServiceItem[];
  linked_inspection_id?: number;
}

export interface InspectionReport {
  id: number;
  vehicle_id: number;
  vehicle?: Vehicle;
  inspection_date: string;
  overall_status: 'good' | 'needs_attention' | 'replace';
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: InspectionItem[];
}

export interface InspectionItem {
  id: number;
  report_id: number;
  category: string;
  item_name: string;
  status: 'good' | 'needs_attention' | 'replace';
  notes?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface DashboardStats {
  total_clients: number;
  total_vehicles: number;
  total_codes: number;
  active_codes: number;
  recent_services: number;
  total_revenue: number;
}

// Form types
export interface ClientFormData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface VehicleFormData {
  client_id: number;
  make: string;
  model: string;
  year: number;
  vin?: string;
  license_plate?: string;
  color?: string;
  mileage?: number;
}

export interface ClientCodeFormData {
  code?: string;
  client_id?: number;
}

export interface ServiceItemFormData {
  service_type: string;
  service_name: string;
  description?: string;
  price: number;
}

export interface ServiceRecordFormData {
  vehicle_id: number;
  service_date: string;
  status?: string;
  technician_notes?: string;
  service_items: ServiceItemFormData[];
  linked_inspection_id?: number;
}

export interface ServiceType {
  type: string;
  name: string;
  description: string;
  base_price: number;
}

export interface InspectionReportFormData {
  vehicle_id: number;
  inspection_date: string;
  overall_condition: string;
  technician_notes?: string;
  recommendations?: string;
  items: InspectionItemFormData[];
}

export interface InspectionItemFormData {
  item_name: string;
  status: string;
  notes?: string;
}

// UI state types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface FilterState {
  search: string;
  status?: 'active' | 'inactive' | 'all';
  dateFrom?: string;
  dateTo?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: string;
  direction: SortDirection;
}

// Navigation types
export type AdminSection = 'dashboard' | 'clients' | 'vehicles' | 'inspections' | 'codes' | 'services' | 'settings';

export interface NavItem {
  id: AdminSection;
  label: string;
  icon: string;
  count?: number;
}

// Toast notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Export utility type helpers
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;