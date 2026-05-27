export type ButtonStyle = "filled" | "outline" | "soft";

export interface GlobalAppearance {
  bio: string;
  avatarDataUrl: string | null;
  themeId: string;
  buttonStyle: ButtonStyle;
  buttonAccent: string;
  buttonTextColor: string;
  bioTextColor?: string;
  usernameTextColor?: string;
  socialIconColor?: string;
  social: Record<string, string>;
}

export interface SubLink {
  id: string;
  title: string;
  url: string;
}

export interface LinkAppearance {
  bio: string;
  avatarDataUrl: string | null;
  bgColor: string;
  bgImageDataUrl: string | null;
  buttonStyle: ButtonStyle;
  buttonAccent: string;
  buttonTextColor: string;
  bioTextColor?: string;
  usernameTextColor?: string;
  socialIconColor?: string;
  social: Record<string, string>;
  subLinks: SubLink[];
}

export interface AppearanceResponse {
  success: boolean;
  data: { appearance: GlobalAppearance | LinkAppearance | Record<string, unknown> };
}
