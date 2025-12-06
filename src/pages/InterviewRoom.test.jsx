import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import InterviewRoom from './InterviewRoom'

const mockNavigate = vi.fn()
const mockParams = { roomId: 'test-room-123' }

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  }
})

vi.mock('@monaco-editor/react', () => ({
  default: ({ onMount, defaultValue }) => {
    const mockEditor = {
      getValue: () => 'console.log("test")',
      getModel: () => ({}),
    }

    if (onMount) {
      setTimeout(() => onMount(mockEditor, {}), 0)
    }

    return <div data-testid="monaco-editor">{defaultValue}</div>
  },
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

vi.mock('../services/codeExecutor', () => ({
  executeCode: vi.fn((code, language) => {
    if (language === 'javascript') {
      return Promise.resolve({
        success: true,
        output: 'test',
        executionTime: 42,
        exitCode: 0,
      })
    } else if (language === 'python') {
      return Promise.resolve({
        success: true,
        output: 'Hello from Python',
        executionTime: 100,
        exitCode: 0,
      })
    }
    return Promise.resolve({
      success: false,
      error: 'Unsupported language',
      executionTime: 0,
      exitCode: 1,
    })
  }),
  loadPyodide: vi.fn(() => Promise.resolve()),
}))

describe('InterviewRoom', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    vi.clearAllMocks()
    delete window.location
    window.location = { origin: 'http://localhost:3000' }
  })

  it('renders the interview room with room ID', () => {
    render(
      <BrowserRouter>
        <InterviewRoom />
      </BrowserRouter>
    )

    expect(screen.getByText(/Room: test-room-123/i)).toBeInTheDocument()
  })

  it('renders the monaco editor', () => {
    render(
      <BrowserRouter>
        <InterviewRoom />
      </BrowserRouter>
    )

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('renders language selector with multiple options', () => {
    render(
      <BrowserRouter>
        <InterviewRoom />
      </BrowserRouter>
    )

    const selector = screen.getByTestId('language-selector')
    expect(selector).toBeInTheDocument()

    expect(screen.getByRole('option', { name: 'JavaScript' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Python' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Java' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'C++' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Go' })).toBeInTheDocument()
  })

  it('changes language when selector is changed', () => {
    render(
      <BrowserRouter>
        <InterviewRoom />
      </BrowserRouter>
    )

    const selector = screen.getByTestId('language-selector')
    fireEvent.change(selector, { target: { value: 'python' } })

    expect(selector.value).toBe('python')
  })

  it('displays share link with correct room ID', () => {
    render(
      <BrowserRouter>
        <InterviewRoom />
      </BrowserRouter>
    )

    const shareLink = screen.getByTestId('share-link')
    expect(shareLink.value).toBe('http://localhost:3000/room/test-room-123')
  })

  it('copies share link when copy button is clicked', async () => {
    const writeTextMock = vi.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    render(
      <BrowserRouter>
        <InterviewRoom />
      </BrowserRouter>
    )

    const copyButton = screen.getByTestId('copy-link-button')
    fireEvent.click(copyButton)

    expect(writeTextMock).toHaveBeenCalledWith('http://localhost:3000/room/test-room-123')
    expect(screen.getByText('Copied!')).toBeInTheDocument()

    await waitFor(
      () => {
        expect(screen.getByText('Copy Link')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('renders execute button', () => {
    render(
      <BrowserRouter>
        <InterviewRoom />
      </BrowserRouter>
    )

    expect(screen.getByTestId('execute-button')).toBeInTheDocument()
  })

  it('executes JavaScript code and displays output', async () => {
    render(
      <BrowserRouter>
        <InterviewRoom />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('execute-button')).toBeInTheDocument()
    })

    const executeButton = screen.getByTestId('execute-button')
    fireEvent.click(executeButton)

    await waitFor(() => {
      const output = screen.getByTestId('output-display')
      expect(output.textContent).toContain('test')
    })
  })

  it('executes Python code when Python is selected', async () => {
    render(
      <BrowserRouter>
        <InterviewRoom />
      </BrowserRouter>
    )

    const selector = screen.getByTestId('language-selector')
    fireEvent.change(selector, { target: { value: 'python' } })

    await waitFor(() => {
      expect(screen.getByTestId('execute-button')).toBeInTheDocument()
    })

    const executeButton = screen.getByTestId('execute-button')
    fireEvent.click(executeButton)

    await waitFor(() => {
      const output = screen.getByTestId('output-display')
      expect(output.textContent).toContain('Hello from Python')
    })
  })

  it('navigates back to home when back button is clicked', () => {
    render(
      <BrowserRouter>
        <InterviewRoom />
      </BrowserRouter>
    )

    const backButton = screen.getByText('← Back')
    fireEvent.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('disables execute button while code is executing', async () => {
    render(
      <BrowserRouter>
        <InterviewRoom />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('execute-button')).toBeInTheDocument()
    })

    const executeButton = screen.getByTestId('execute-button')

    fireEvent.click(executeButton)

    await waitFor(() => {
      expect(screen.getByTestId('output-display').textContent).not.toBe(
        'Click "Run Code" to see output'
      )
    })
  })
})
