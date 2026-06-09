export interface CameraStartOptions {
  facingMode?: 'user' | 'environment';
  deviceId?: string;
}

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export interface CameraAdapter {
  start(options?: CameraStartOptions): Promise<MediaStream>;
  stop(stream: MediaStream): Promise<void>;
  listDevices(): Promise<CameraDevice[]>;
  requestPermission(): Promise<'granted' | 'denied' | 'prompt'>;
}
