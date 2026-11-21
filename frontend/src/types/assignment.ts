export interface Officer {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: string;
  department_name_ml?: string | null;
}

export interface AssignmentPayload {
  assigned_to_id: string;
  deadline?: string;
  instructions?: string;
}

export interface ResolutionPayload {
  resolution_notes: string;
  evidence_photos: {
    file_url: string;
    file_type: string;
    file_size_bytes: number;
    evidence_type?: string;
  }[];
}
