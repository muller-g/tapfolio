export interface PublicUser {
  name: string;
  username: string;
}

export interface PublicLink {
  id: number;
  title: string;
  url: string;
  sort_order: number;
  appearance: Record<string, unknown>;
}

export interface ProfileResponse {
  success: boolean;
  data: {
    user: PublicUser;
    appearance: Record<string, unknown>;
    links: PublicLink[];
  };
}
