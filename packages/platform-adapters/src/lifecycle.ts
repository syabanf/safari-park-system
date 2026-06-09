export interface AppLifecycleAdapter {
  onResume(cb: () => void): () => void;
  onPause(cb: () => void): () => void;
  onOnline(cb: () => void): () => void;
  onOffline(cb: () => void): () => void;
  isOnline(): boolean;
}
