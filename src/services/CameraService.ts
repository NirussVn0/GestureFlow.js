import { IService } from "./IService";

export class CameraService implements IService<HTMLVideoElement> {
  private static instance: CameraService;
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  private constructor() {}

  public static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  public async initialize(videoElement: HTMLVideoElement): Promise<void> {
    if (this.stream) {
      this.dispose();
    }
    
    try {
      this.videoElement = videoElement;
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      });
      
      this.videoElement.srcObject = this.stream;
      await new Promise<void>((resolve) => {
        if (!this.videoElement) return;
        this.videoElement.onloadedmetadata = () => {
          this.videoElement?.play();
          resolve();
        };
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public dispose(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  public getStream(): MediaStream | null {
    return this.stream;
  }
}
