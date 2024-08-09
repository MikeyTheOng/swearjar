import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Use this function to make an API request to backend; the response is expected to be a JSON object
export async function apiRequest({
  route,
  method,
  body = null
}: {
  route: string,
  method: string,
  body?: any
}) {
  const apiUrl = `${process.env.BACKEND_URL}${route}`;

  const config = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...(body && { body: JSON.stringify(body) }), // Conditionally include of the body
  };

  try {
    const response = await fetch(apiUrl, config);

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || `HTTP error! Status: ${response.status}`);
    }

    return {
      status: response.status,
      response: responseData,
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Fetch error: ${error.message}`);
      throw error;
    } else {
      console.error(`Unexpected error: ${JSON.stringify(error)}`);
      throw new Error('Unexpected error occurred');
    }
  }
};
