export type AlertLevel = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertSource = 'OFFICIAL_WARNING' | 'COMMUNITY_REPORT' | 'SIMULATED_DEMO_ALERT';

export interface Alert {
  id: string;
  title_ml: string;
  title_en: string;
  message_ml: string;
  message_en: string;
  alert_level: AlertLevel;
  alert_source: AlertSource;
  affected_district?: string | null;
  is_active: boolean;
  created_by: string;
  creator_name?: string | null;
  expires_at?: string | null;
  created_at: string;
}

export interface AlertCreatePayload {
  title_ml: string;
  title_en: string;
  message_ml: string;
  message_en: string;
  alert_level: AlertLevel;
  alert_source: AlertSource;
  affected_district?: string;
  expires_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  reference_type?: 'COMPLAINT' | 'ALERT' | null;
  reference_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  unread_count: number;
  notifications: Notification[];
}
