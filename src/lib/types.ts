export type Role = 'super_admin' | 'facility_manager' | 'field_agent' | 'ngo_coordinator' | 'auditor';
export type FacilityStatus = 'active' | 'offline' | 'critical' | 'warning';
export type TransferStatus = 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'completed' | 'incident' | 'cancelled';
export type AlertSeverity = 'critical' | 'warning';
export type AlertType = 'low_stock' | 'expiry' | 'temperature' | 'sync_inactive';
export type ResourceCategory = 'sang' | 'medicaments' | 'vaccins' | 'materiel' | 'autre';

export interface Organization {
  id: string;
  name: string;
  type: string;
  country_code: string;
  regions: string[];
  logo_url: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: string;
  tenant_id: string;
  org_id: string;
  name: string;
  type: string;
  country_code: string;
  region: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  storage_zones: string[];
  bed_capacity: number | null;
  status: FacilityStatus;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  tenant_id: string;
  org_id: string;
  facility_id: string | null;
  email: string;
  name: string;
  role: Role;
  zone: string | null;
  status: string;
  last_login_at: string | null;
  created_at: string;
}

export interface Resource {
  id: string;
  tenant_id: string;
  facility_id: string;
  name: string;
  dci: string | null;
  category: ResourceCategory;
  zone: string | null;
  unit_of_measure: string;
  total_quantity: number;
  alert_threshold: number;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: string;
  tenant_id: string;
  resource_id: string;
  batch_number: string;
  quantity: number;
  expiry_date: string;
  supplier: string | null;
  order_number: string | null;
  created_at: string;
}

export interface InventoryMovement {
  id: string;
  tenant_id: string;
  resource_id: string;
  batch_id: string | null;
  delta: number;
  reason: string;
  location: string | null;
  user_id: string | null;
  transfer_id: string | null;
  created_at: string;
}

export interface Transfer {
  id: string;
  tenant_id: string;
  ref: string;
  resource_id: string;
  quantity: number;
  requesting_facility_id: string;
  source_facility_id: string | null;
  motif: string | null;
  priority: string;
  is_emergency: boolean;
  status: TransferStatus;
  needed_by: string | null;
  transport_notes: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_ref: string | null;
  received_qty: number | null;
  packaging_ok: boolean | null;
  temp_at_opening: number | null;
  condition: string | null;
  receipt_notes: string | null;
  receipt_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  tenant_id: string;
  facility_id: string;
  resource_id: string | null;
  transfer_id: string | null;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string | null;
  is_read: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface AuditEntry {
  id: string;
  tenant_id: string;
  user_id: string | null;
  user_label: string | null;
  action: string;
  detail: string | null;
  result: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export function apiError(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

export function apiOk<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}
