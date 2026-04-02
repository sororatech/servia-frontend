type RequestOptions = {
  credentials?: RequestCredentials;
  headers?: HeadersInit;
};

type ApiClient = {
  get: <T>(path: string, options?: RequestOptions) => Promise<{ data: T }>;
};

function buildUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

function buildHeaders(headers?: HeadersInit) {
  const authToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;

  return {
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Token ${authToken}` } : {}),
    ...headers,
  };
}

export const api: ApiClient = {
  async get<T>(path: string, options: RequestOptions = {}) {
    const response = await fetch(buildUrl(path), {
      method: "GET",
      credentials: options.credentials ?? "include",
      headers: buildHeaders(options.headers),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`GET ${path} failed with status ${response.status}`);
    }

    const data = (await response.json()) as T;
    return { data };
  },
};
