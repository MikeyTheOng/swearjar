import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function buildUrlWithParams(endpoint: string, queryParams?: Record<string, any>): string {
  const origin = process.env.NEXT_PUBLIC_AUTH_URL || '';
  const urlObject = new URL(endpoint, origin);
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObject.searchParams.append(key, value);
      }
    });
  }
  return urlObject.toString();
}

export const fetcher = async <T>(
  url: string,
  queryParams?: Record<string, any>,
  options?: RequestInit
): Promise<T> => {
  const fullUrl = buildUrlWithParams(url, queryParams);
  const response = await fetch(fullUrl, {
    credentials: 'include', // Automatically include credentials (e.g., cookies)
    ...options,             // Spread any other options passed in (e.g., headers, method)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'An error occurred while fetching data');
  }
  const data = await response.json();
  return data;
};
