export interface SubLinkMetric {
  button_key: string;
  label: string;
  url: string;
  clicks: number;
}

export interface SocialMetric {
  platform: string;
  clicks: number;
}

export interface LinkMetric {
  id: number;
  title: string;
  is_active: boolean;
  views: number;
  total_clicks: number;
  sub_links: SubLinkMetric[];
  social: SocialMetric[];
}

export interface MetricsSummary {
  total_views: number;
  total_clicks: number;
  ctr: number;
}

export interface MetricsData {
  summary: MetricsSummary;
  links: LinkMetric[];
}

export interface MetricsResponse {
  success: boolean;
  data: MetricsData;
}
