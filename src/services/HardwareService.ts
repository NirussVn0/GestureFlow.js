export interface HardwareInfo {
  cpuCores: number;
  gpuRenderer: string;
  deviceMemoryGb: number | "unknown";
}

const GPU_RENDERER_UNKNOWN = "Unknown GPU";

function resolveGpuRenderer(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");

    if (!gl) return GPU_RENDERER_UNKNOWN;

    const ext = (gl as WebGLRenderingContext).getExtension(
      "WEBGL_debug_renderer_info"
    );
    if (!ext) return GPU_RENDERER_UNKNOWN;

    return (
      (gl as WebGLRenderingContext).getParameter(
        ext.UNMASKED_RENDERER_WEBGL
      ) ?? GPU_RENDERER_UNKNOWN
    );
  } catch {
    return GPU_RENDERER_UNKNOWN;
  }
}

export class HardwareService {
  private static instance: HardwareService;
  private cachedInfo: HardwareInfo | null = null;

  private constructor() {}

  public static getInstance(): HardwareService {
    if (!HardwareService.instance) {
      HardwareService.instance = new HardwareService();
    }
    return HardwareService.instance;
  }

  public detect(): HardwareInfo {
    if (this.cachedInfo) return this.cachedInfo;

    const nav = navigator as Navigator & { deviceMemory?: number };

    this.cachedInfo = {
      cpuCores: navigator.hardwareConcurrency ?? 1,
      gpuRenderer: resolveGpuRenderer(),
      deviceMemoryGb: nav.deviceMemory ?? "unknown",
    };

    return this.cachedInfo;
  }
}
