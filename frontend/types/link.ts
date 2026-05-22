export interface Link {
  id: number;
  title: string;
  url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface LinkListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface LinkListResponse {
  success: boolean;
  data: Link[];
  meta: LinkListMeta;
}

export interface LinkResponse {
  success: boolean;
  data: Link;
}

export interface CreateLinkPayload {
  title: string;
  is_active?: boolean;
}

export interface UpdateLinkPayload {
  title?: string;
  is_active?: boolean;
}
