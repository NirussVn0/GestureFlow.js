import {
  FaceLandmarker,
  FilesetResolver,
  FaceLandmarkerResult
} from "@mediapipe/tasks-vision";

export interface FaceTrackingConfig {
  delegate: "GPU" | "CPU";
  runningMode: "IMAGE" | "VIDEO";
  numFaces: number;
}

export class FaceTrackingService {
  private static instance: FaceTrackingService;
  private faceLandmarker: FaceLandmarker | null = null;
  private isLoaded: boolean = false;

  private constructor() {}

  public static getInstance(): FaceTrackingService {
    if (!FaceTrackingService.instance) {
      FaceTrackingService.instance = new FaceTrackingService();
    }
    return FaceTrackingService.instance;
  }

  public async initialize(config: FaceTrackingConfig): Promise<void> {
    if (this.isLoaded) return;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: config.delegate,
        },
        outputFaceBlendshapes: true,
        runningMode: config.runningMode,
        numFaces: config.numFaces,
      });
      this.isLoaded = true;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public detectForVideo(
    videoElement: HTMLVideoElement,
    timestamp: number
  ): FaceLandmarkerResult | null {
    if (!this.faceLandmarker || !this.isLoaded) return null;
    
    try {
      return this.faceLandmarker.detectForVideo(videoElement, timestamp);
    } catch {
      return null;
    }
  }

  public stop(): void {
    if (this.faceLandmarker) {
      this.faceLandmarker.close();
      this.faceLandmarker = null;
    }
    this.isLoaded = false;
  }
}
