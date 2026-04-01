/**
 * Typed API Error class
 */
export class ApiError extends Error {
  public status: number;
  public errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Fetch options with credentials included
 */
interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Build default headers
 */
function buildHeaders(extraHeaders?: HeadersInit): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
}

/**
 * Pre-request hook: attach cart UUID header
 */
function preRequestHook(headers: HeadersInit, getCartId: () => string | null): HeadersInit {
  const cartId = getCartId();
  if (cartId) {
    return { ...headers, 'X-Cart-Id': cartId };
  }
  return headers;
}

/**
 * Post-response hook: handle 401 by triggering logout
 */
async function postResponseHook(response: Response, logout: () => void): Promise<void> {
  if (response.status === 401) {
    logout();
    window.location.href = '/login';
    throw new ApiError(401, 'Unauthorized - Session expired');
  }
}

/**
 * Process response: parse JSON or throw ApiError
 */
async function processResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errors: Record<string, string[]> | undefined;
    let message = response.statusText;

    try {
      const body = await response.json();
      message = body.message || response.statusText;
      errors = body.errors;
    } catch {
      // Response body is not JSON
    }

    throw new ApiError(response.status, message, errors);
  }

  const data = await response.json();
  return data as T;
}

/**
 * Core typed fetch wrapper
 */
async function apiFetch<T>(
  url: string,
  options: FetchOptions = {},
  deps: { getCartId: () => string | null; logout: () => void }
): Promise<T> {
  const { getCartId, logout } = deps;
  const { skipAuth, headers, ...restOptions } = options;

  let finalHeaders = buildHeaders(headers);

  if (!skipAuth) {
    finalHeaders = preRequestHook(finalHeaders, getCartId);
  }

  const response = await fetch(url, {
    ...restOptions,
    headers: finalHeaders,
    credentials: 'include',
  });

  if (!skipAuth) {
    await postResponseHook(response, logout);
  }

  return processResponse<T>(response);
}

/**
 * Typed GET helper
 */
export async function apiGet<T>(
  url: string,
  options: FetchOptions = {},
  deps: { getCartId: () => string | null; logout: () => void }
): Promise<T> {
  return apiFetch<T>(url, { ...options, method: 'GET' }, deps);
}

/**
 * Typed POST helper
 */
export async function apiPost<T>(
  url: string,
  body: unknown,
  options: FetchOptions = {},
  deps: { getCartId: () => string | null; logout: () => void }
): Promise<T> {
  return apiFetch<T>(url, { ...options, method: 'POST', body: JSON.stringify(body) }, deps);
}

/**
 * Typed PUT helper
 */
export async function apiPut<T>(
  url: string,
  body: unknown,
  options: FetchOptions = {},
  deps: { getCartId: () => string | null; logout: () => void }
): Promise<T> {
  return apiFetch<T>(url, { ...options, method: 'PUT', body: JSON.stringify(body) }, deps);
}

/**
 * Typed PATCH helper
 */
export async function apiPatch<T>(
  url: string,
  body: unknown,
  options: FetchOptions = {},
  deps: { getCartId: () => string | null; logout: () => void }
): Promise<T> {
  return apiFetch<T>(url, { ...options, method: 'PATCH', body: JSON.stringify(body) }, deps);
}

/**
 * Typed DELETE helper
 */
export async function apiDelete<T>(
  url: string,
  options: FetchOptions = {},
  deps: { getCartId: () => string | null; logout: () => void }
): Promise<T> {
  return apiFetch<T>(url, { ...options, method: 'DELETE' }, deps);
}
