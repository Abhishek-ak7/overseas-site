// Utility functions for making authenticated API calls

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export class ApiClient {
  private static getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    }
  }

  static async get<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'Request failed' }
      }

      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' }
    }
  }

  static async post<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'Request failed' }
      }

      return { data, message: data.message }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' }
    }
  }

  static async put<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'Request failed' }
      }

      return { data, message: data.message }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' }
    }
  }

  static async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'Request failed' }
      }

      return { data, message: data.message }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' }
    }
  }
}

// Helper function to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

// Legacy fetch function with authentication for backward compatibility
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }

  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })
}