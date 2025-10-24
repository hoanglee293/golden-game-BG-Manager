// Authentication utilities for JWT token management

export interface User {
  walletId: number
  solanaAddress: string
  nickName: string
  ethAddress: string
  isBgAffiliate: boolean
}

export interface LoginCredentials {
  walletAddress: string
  signature: string
  message: string
}

// Token management
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  }
  return null
}

export const setAuthToken = (token: string, rememberMe: boolean = false): void => {
  if (typeof window !== 'undefined') {
    if (rememberMe) {
      localStorage.setItem('auth_token', token)
    } else {
      sessionStorage.setItem('auth_token', token)
    }
  }
}

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_token')
  }
}

export const isAuthenticated = (): boolean => {
  const token = getAuthToken()
  if (!token) return false
  
  try {
    // Basic JWT validation (check if token is not expired)
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp > currentTime
  } catch {
    return false
  }
}

// API authentication
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  }
}

// Login API call
export const loginUser = async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
  
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Login failed')
  }

  return response.json()
}

// Logout
export const logoutUser = (): void => {
  removeAuthToken()
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
} 