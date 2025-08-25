import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  // Get token from localStorage
  const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const token = user ? JSON.parse(user).token : null;

  if (!token) {
    throw new Error('No authorization token found. Please log in.');
  }

  // Merge headers
  const headers = {
    ...(init.headers || {}),
    'Authorization': `Bearer ${token}`,
  };

  // Compose new init
  const newInit = {
    ...init,
    headers,
  };

  return fetch(input, newInit);
}
