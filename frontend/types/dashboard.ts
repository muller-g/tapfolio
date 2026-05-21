export interface DashboardStats {
  total_views: number;
  total_clicks: number;
  recent_views: number;
  recent_clicks: number;
  active_links: number;
  ctr: number;
  period_days: number;
}

export interface TopLink {
  id: number;
  title: string;
  url: string;
  is_active: boolean;
  clicks: number;
  percentage: number;
}

export interface DayActivity {
  date: string;
  label: string;
  clicks: number;
  views: number;
}

export interface DeviceBreakdown {
  mobile: number;
  desktop: number;
  mobile_percent: number;
  desktop_percent: number;
}

export interface DashboardData {
  stats: DashboardStats;
  top_links: TopLink[];
  weekly_activity: DayActivity[];
  devices: DeviceBreakdown;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}
