const DEFAULT_BACKEND_URL = 'http://localhost:3000';

export function getBackendBaseUrl(): string {
  return getEnv('NEXT_PUBLIC_BACKEND_URL', DEFAULT_BACKEND_URL);
}

export async function extractErrorMessage(response: Response): Promise<string | null> {
  try {
    const data = await response.json();
    if (data && typeof data === 'object') {
      if (typeof (data as Record<string, unknown>).message === 'string') {
        return (data as Record<string, string>).message;
      }
      const message = (data as { message?: unknown[] }).message;
      if (Array.isArray(message) && message.length > 0) {
        return String(message[0]);
      }
      if (typeof (data as Record<string, unknown>).error === 'string') {
        return (data as Record<string, string>).error;
      }
    }
    return null;
  } catch (error) {
    console.warn('Failed to parse error response', error);
    return null;
  }
}

function getEnv(name: string, fallback: string): string {
  if (typeof process !== 'undefined' && process.env?.[name]) {
    return process.env[name] as string;
  }
  if (typeof window !== 'undefined') {
    const globalWithEnv = window as unknown as Record<string, string | undefined>;
    const fromWindow = globalWithEnv[name];
    if (fromWindow) {
      return fromWindow;
    }
  }
  return fallback;
}
