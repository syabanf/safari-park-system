export interface SharePayload {
  title?: string;
  text?: string;
  url?: string;
}

export interface ShareAdapter {
  canShare(): boolean;
  share(payload: SharePayload): Promise<void>;
}
