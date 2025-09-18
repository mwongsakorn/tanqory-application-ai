declare module 'expo-file-system/legacy' {
  export interface ReadAsStringOptions {
    encoding?: string;
  }

  export function readAsStringAsync(uri: string, options?: ReadAsStringOptions): Promise<string>;
}
