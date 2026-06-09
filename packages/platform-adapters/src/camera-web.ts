import type { CameraAdapter, CameraDevice, CameraStartOptions } from './camera';

export const webCameraAdapter: CameraAdapter = {
  async start(options?: CameraStartOptions): Promise<MediaStream> {
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: options?.deviceId
        ? { deviceId: { exact: options.deviceId } }
        : { facingMode: options?.facingMode ?? 'environment' },
    };
    return navigator.mediaDevices.getUserMedia(constraints);
  },

  async stop(stream: MediaStream): Promise<void> {
    for (const track of stream.getTracks()) track.stop();
  },

  async listDevices(): Promise<CameraDevice[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === 'videoinput')
      .map((d) => ({ deviceId: d.deviceId, label: d.label || 'Camera' }));
  },

  async requestPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (!('permissions' in navigator)) return 'prompt';
    try {
      const result = await navigator.permissions.query({
        name: 'camera' as PermissionName,
      });
      return result.state;
    } catch {
      return 'prompt';
    }
  },
};
