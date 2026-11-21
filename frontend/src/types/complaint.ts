export type ComplaintCategory =
  | 'WASTE'
  | 'WATER_POLLUTION'
  | 'DRAINAGE'
  | 'FLOODING'
  | 'AIR_POLLUTION'
  | 'DEFORESTATION'
  | 'ILLEGAL_MINING'
  | 'OTHER';

export type ComplaintSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'ACTION_TAKEN'
  | 'RESOLVED'
  | 'REJECTED'
  | 'APPEALED';

export interface LocationData {
  id?: string;
  latitude: number;
  longitude: number;
  district: string;
  lsgd_type: string;
  lsgd_name: string;
  ward_number?: string | null;
  landmark?: string | null;
}

export interface EvidenceItem {
  id?: string;
  file_url: string;
  file_type: string;
  file_size_bytes: number;
  evidence_type: string;
  created_at?: string;
}

export interface ComplaintUpdate {
  id: string;
  previous_status: string;
  new_status: string;
  remarks?: string | null;
  created_at: string;
  author_name?: string | null;
}

export interface ComplaintAssignment {
  id: string;
  complaint_id: string;
  assigned_by_id: string;
  assigned_by_name?: string | null;
  assigned_to_id: string;
  assigned_to_name?: string | null;
  instructions?: string | null;
  deadline?: string | null;
  status: string;
  created_at: string;
}

export interface Complaint {
  id: string;
  tracking_code: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  category_display_ml: string;
  severity: ComplaintSeverity;
  current_status: ComplaintStatus;
  status_display_ml: string;
  reporter_id: string;
  reporter_name?: string | null;
  department_id?: string | null;
  department_name_ml?: string | null;
  created_at: string;
  updated_at: string;
  location: LocationData;
  evidence: EvidenceItem[];
  updates: ComplaintUpdate[];
  assignments?: ComplaintAssignment[];
}

export interface ComplaintCreatePayload {
  title: string;
  description: string;
  category: ComplaintCategory;
  severity?: ComplaintSeverity;
  location: LocationData;
  evidence?: {
    file_url: string;
    file_type: string;
    file_size_bytes: number;
    evidence_type?: string;
  }[];
}
