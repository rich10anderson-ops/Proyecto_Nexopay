import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Google Identity Services API
if (typeof window !== 'undefined') {
  window.google = {
    accounts: {
      id: {
        initialize: vi.fn(),
        prompt: vi.fn(),
        renderButton: vi.fn(),
        disableAutoSelect: vi.fn(),
      },
    },
  } as any
}

// Mock localStorage if in node context (happy-dom handles it but we ensure clean states)
const mockStore: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => mockStore[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockStore[key] = String(value)
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStore[key]
  }),
  clear: vi.fn(() => {
    Object.keys(mockStore).forEach((key) => delete mockStore[key])
  }),
}

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
})
