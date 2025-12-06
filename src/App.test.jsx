import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

vi.mock('@monaco-editor/react', () => ({
  default: () => <div data-testid="monaco-editor">Editor</div>,
}))

vi.mock('yjs', () => ({
  Doc: class {
    getText() {
      return {}
    }
    destroy() {}
  },
}))

vi.mock('y-webrtc', () => ({
  WebrtcProvider: class {
    constructor() {
      this.awareness = {}
    }
    destroy() {}
  },
}))

vi.mock('y-monaco', () => ({
  MonacoBinding: class {
    destroy() {}
  },
}))

describe('App', () => {
  it('renders home page by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('Coding Interview Platform')).toBeInTheDocument()
  })

  it('renders interview room when navigating to /room/:roomId', () => {
    render(
      <MemoryRouter initialEntries={['/room/test123']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText(/Room: test123/i)).toBeInTheDocument()
  })
})
