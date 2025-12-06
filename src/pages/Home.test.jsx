import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from './Home'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Home', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders the home page with title and description', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(screen.getByText('Coding Interview Platform')).toBeInTheDocument()
    expect(
      screen.getByText('Collaborate in real-time with syntax highlighting and code execution')
    ).toBeInTheDocument()
  })

  it('renders create room button', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(screen.getByTestId('create-room-button')).toBeInTheDocument()
  })

  it('creates a new room when create button is clicked', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    const createButton = screen.getByTestId('create-room-button')
    fireEvent.click(createButton)

    expect(mockNavigate).toHaveBeenCalledTimes(1)
    const callArg = mockNavigate.mock.calls[0][0]
    expect(callArg).toMatch(/^\/room\/[a-zA-Z0-9_-]{10}$/)
  })

  it('renders join room input and button', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(screen.getByTestId('room-id-input')).toBeInTheDocument()
    expect(screen.getByTestId('join-room-button')).toBeInTheDocument()
  })

  it('joins a room when room ID is entered and join button is clicked', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    const input = screen.getByTestId('room-id-input')
    const joinButton = screen.getByTestId('join-room-button')

    fireEvent.change(input, { target: { value: 'testroom123' } })
    fireEvent.click(joinButton)

    expect(mockNavigate).toHaveBeenCalledWith('/room/testroom123')
  })

  it('does not navigate when join button is clicked with empty room ID', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    const joinButton = screen.getByTestId('join-room-button')
    fireEvent.click(joinButton)

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('trims whitespace from room ID before joining', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    const input = screen.getByTestId('room-id-input')
    const joinButton = screen.getByTestId('join-room-button')

    fireEvent.change(input, { target: { value: '   testroom123   ' } })
    fireEvent.click(joinButton)

    expect(mockNavigate).toHaveBeenCalledWith('/room/   testroom123   ')
  })
})
