export class Room {
  constructor({ id, language = 'javascript', initialCode = '// Start coding...', expiresIn = 24 }) {
    this.id = id
    this.language = language
    this.codeSnippet = initialCode
    this.createdAt = new Date()
    this.expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000)
    this.activeUsers = 0
    this.version = 0
  }

  toJSON() {
    return {
      id: this.id,
      language: this.language,
      codeSnippet: this.codeSnippet,
      createdAt: this.createdAt.toISOString(),
      expiresAt: this.expiresAt.toISOString(),
      activeUsers: this.activeUsers,
      shareUrl: `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/room/${this.id}`,
    }
  }

  isExpired() {
    return new Date() > this.expiresAt
  }

  updateCode(code, language) {
    this.codeSnippet = code
    if (language) {
      this.language = language
    }
    this.version++
    this.lastUpdated = new Date()
  }

  incrementUsers() {
    this.activeUsers++
  }

  decrementUsers() {
    if (this.activeUsers > 0) {
      this.activeUsers--
    }
  }
}
