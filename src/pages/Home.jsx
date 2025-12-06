import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const [roomId, setRoomId] = useState('')

  const createNewRoom = () => {
    const newRoomId = nanoid(10)
    navigate(`/room/${newRoomId}`)
  }

  const joinRoom = (e) => {
    e.preventDefault()
    if (roomId.trim()) {
      navigate(`/room/${roomId}`)
    }
  }

  return (
    <div className="home-container">
      <h1>Coding Interview Platform</h1>
      <p>Collaborate in real-time with syntax highlighting and code execution</p>

      <div className="actions">
        <div className="action-card">
          <h2>Create New Interview</h2>
          <button
            onClick={createNewRoom}
            className="primary-button"
            data-testid="create-room-button"
          >
            Create Room
          </button>
        </div>

        <div className="divider">OR</div>

        <div className="action-card">
          <h2>Join Existing Interview</h2>
          <form onSubmit={joinRoom}>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="room-input"
              data-testid="room-id-input"
            />
            <button
              type="submit"
              className="secondary-button"
              data-testid="join-room-button"
            >
              Join Room
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Home
