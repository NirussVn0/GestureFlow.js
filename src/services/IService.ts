export interface IService<TConfig = void> {
  initialize(config?: TConfig): Promise<void> | void;
  dispose(): void;
}
