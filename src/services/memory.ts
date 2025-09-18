import { Asset } from 'expo-asset';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { memoryModules } from '@/memory/manifest';

let cachedMemoryPromise: Promise<string> | null = null;

async function loadModuleContent(moduleId: number): Promise<string> {
  const asset = Asset.fromModule(moduleId);
  if (!asset.localUri) {
    await asset.downloadAsync();
  }
  const fileUri = asset.localUri ?? asset.uri;
  if (!fileUri) {
    return '';
  }
  try {
    return await readAsStringAsync(fileUri, {
      encoding: 'utf8',
    });
  } catch (error) {
    console.warn('Failed to read memory file', fileUri, error);
    return '';
  }
}

function sanitizeChunk(text: string) {
  return text.replace(/\r\n/g, '\n').trim();
}

export async function loadCompanyMemory(): Promise<string> {
  if (cachedMemoryPromise) {
    return cachedMemoryPromise;
  }

  cachedMemoryPromise = (async () => {
    const contents = await Promise.all(memoryModules.map((moduleId) => loadModuleContent(moduleId)));
    const merged = contents
      .map(sanitizeChunk)
      .filter(Boolean)
      .join('\n\n---\n\n');
    const maxChars = 6000;
    return merged.length > maxChars ? `${merged.slice(0, maxChars)}\n\n[Memory truncated]` : merged;
  })();

  return cachedMemoryPromise;
}
