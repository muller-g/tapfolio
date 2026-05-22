const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1";

interface TrackPayload {
  username: string;
  event_type: "view" | "click";
  link_id?: number;
  button_key?: string;
  button_type?: "sublink" | "social";
}

export class TrackService {
  static track(payload: TrackPayload): void {
    fetch(`${API_URL}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }
}
