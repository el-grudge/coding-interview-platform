import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import InterviewRoom from './pages/InterviewRoom'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomId" element={<InterviewRoom />} />
    </Routes>
  )
}

export default App
