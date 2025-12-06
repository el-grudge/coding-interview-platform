export class Session {
  constructor(roomId, userId, userName = null) {
    this.id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.roomId = roomId
    this.userId = userId
    this.userName = userName
    this.joinedAt = new Date()
    this.isActive = true
    this.lastActivity = new Date()
  }

  toJSON() {
    return {
      id: this.userId,
      userName: this.userName,
      joinedAt: this.joinedAt.toISOString(),
      isActive: this.isActive,
    }
  }

  updateActivity() {
    this.lastActivity = new Date()
  }

  deactivate() {
    this.isActive = false
  }
}
