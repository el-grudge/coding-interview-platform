class Database {
  constructor() {
    this.rooms = new Map()
    this.sessions = new Map()
    this.startCleanupInterval()
  }

  createRoom(room) {
    this.rooms.set(room.id, room)
    return room
  }

  getRoom(roomId) {
    const room = this.rooms.get(roomId)
    if (room && room.isExpired()) {
      this.deleteRoom(roomId)
      return null
    }
    return room
  }

  getAllRooms(limit = 50, offset = 0) {
    const activeRooms = Array.from(this.rooms.values())
      .filter((room) => !room.isExpired())
      .sort((a, b) => b.createdAt - a.createdAt)

    return {
      rooms: activeRooms.slice(offset, offset + limit),
      total: activeRooms.length,
    }
  }

  deleteRoom(roomId) {
    const sessions = Array.from(this.sessions.values()).filter(
      (session) => session.roomId === roomId
    )
    sessions.forEach((session) => this.sessions.delete(session.id))

    return this.rooms.delete(roomId)
  }

  updateRoomCode(roomId, code, language) {
    const room = this.getRoom(roomId)
    if (!room) {
      return null
    }
    room.updateCode(code, language)
    return room
  }

  createSession(session) {
    this.sessions.set(session.id, session)

    const room = this.getRoom(session.roomId)
    if (room) {
      room.incrementUsers()
    }

    return session
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId)
  }

  getSessionsByRoom(roomId) {
    return Array.from(this.sessions.values()).filter(
      (session) => session.roomId === roomId && session.isActive
    )
  }

  deleteSession(sessionId) {
    const session = this.sessions.get(sessionId)
    if (session) {
      const room = this.getRoom(session.roomId)
      if (room) {
        room.decrementUsers()
      }
      session.deactivate()
    }
    return this.sessions.delete(sessionId)
  }

  cleanupExpiredRooms() {
    let cleanedCount = 0
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.isExpired()) {
        this.deleteRoom(roomId)
        cleanedCount++
      }
    }
    return cleanedCount
  }

  cleanupInactiveSessions() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    let cleanedCount = 0

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastActivity < fiveMinutesAgo) {
        this.deleteSession(sessionId)
        cleanedCount++
      }
    }
    return cleanedCount
  }

  startCleanupInterval() {
    setInterval(() => {
      this.cleanupExpiredRooms()
      this.cleanupInactiveSessions()
    }, 60 * 1000)
  }

  reset() {
    this.rooms.clear()
    this.sessions.clear()
  }
}

export const db = new Database()
