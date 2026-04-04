import { IService } from "./IService";

export class VirtualCamService implements IService<HTMLCanvasElement> {
  private static instance: VirtualCamService;
  private stream: MediaStream | null = null;
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(stream: MediaStream | null) => void> = new Set();
  private isBroadcasting = false;

  private constructor() {}

  public static getInstance(): VirtualCamService {
    if (!VirtualCamService.instance) {
      VirtualCamService.instance = new VirtualCamService();
    }
    return VirtualCamService.instance;
  }

  /**
   * Captures the stream from the given canvas at 30fps.
   * This stream contains everything drawn on the canvas (video + VFX).
   */
  public initialize(canvas: HTMLCanvasElement): void {
    try {
      // 30 FPS is standard for virtual cameras and webcam pipelines
      this.stream = canvas.captureStream(30);
      
      if (!this.channel) {
        this.channel = new BroadcastChannel("gestureflow-pip-stream");
      }

      this.notifyListeners();
    } catch (e) {
      console.error("Failed to capture canvas stream:", e);
    }
  }

  public dispose(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
      this.notifyListeners();
    }
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.isBroadcasting = false;
  }

  /**
   * Called by the animation loop to send transferable frames to popup windows.
   */
  public broadcastFrame(canvas: HTMLCanvasElement): void {
    if (!this.channel || this.isBroadcasting || typeof createImageBitmap === "undefined") return;

    this.isBroadcasting = true;
    createImageBitmap(canvas).then((bitmap) => {
      // @ts-expect-error - Some TS dom environments complain about transferable array, but [bitmap] is correct
      this.channel?.postMessage({ bitmap }, [bitmap]);
      this.isBroadcasting = false;
    }).catch(() => {
      this.isBroadcasting = false;
    });
  }

  public getStream(): MediaStream | null {
    return this.stream;
  }

  public subscribe(listener: (stream: MediaStream | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.stream); // Send immediate current state
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.stream));
  }
}
