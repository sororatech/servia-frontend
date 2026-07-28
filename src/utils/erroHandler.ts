export class APIError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(`API Error: ${detail}`);
    this.name = 'APIError';
    this.status = status;
    this.detail = detail;
  }
}

export function formatErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return error.status >= 500 
      ? 'Server error. Please try again later.' 
      : error.detail || 'Failed to load data';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

export async function safeFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(response.status, errorData.detail || response.statusText || 'Unknown error');
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(0, error instanceof Error ? error.message : 'Network request failed');
  }
}