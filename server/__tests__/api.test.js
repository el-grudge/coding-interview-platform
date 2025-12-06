import request from 'supertest'
import { createApp } from '../src/app.js'
import { db } from '../src/services/database.js'

const app = createApp()

describe('API Integration Tests', () => {
  beforeEach(() => {
    db.reset()
  })

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/v1/health')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status', 'ok')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('uptime')
    })
  })

  describe('Room Management', () => {
    describe('POST /api/v1/rooms', () => {
      it('should create a new room with default settings', async () => {
        const response = await request(app).post('/api/v1/rooms').send({})

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('id')
        expect(response.body.id).toMatch(/^[a-zA-Z0-9_-]{10}$/)
        expect(response.body).toHaveProperty('language', 'javascript')
        expect(response.body).toHaveProperty('createdAt')
        expect(response.body).toHaveProperty('expiresAt')
        expect(response.body).toHaveProperty('activeUsers', 0)
        expect(response.body).toHaveProperty('shareUrl')
      })

      it('should create a room with custom settings', async () => {
        const response = await request(app).post('/api/v1/rooms').send({
          language: 'python',
          initialCode: 'print("Hello")',
          expiresIn: 48,
        })

        expect(response.status).toBe(201)
        expect(response.body.language).toBe('python')
        expect(response.body.codeSnippet).toBe('print("Hello")')
      })

      it('should reject invalid language', async () => {
        const response = await request(app).post('/api/v1/rooms').send({
          language: 'invalid',
        })

        expect(response.status).toBe(400)
        expect(response.body.error).toBe('INVALID_REQUEST')
      })

      it('should reject invalid expiresIn', async () => {
        const response = await request(app).post('/api/v1/rooms').send({
          expiresIn: 200,
        })

        expect(response.status).toBe(400)
      })
    })

    describe('GET /api/v1/rooms', () => {
      it('should list all rooms', async () => {
        await request(app).post('/api/v1/rooms').send({})
        await request(app).post('/api/v1/rooms').send({})

        const response = await request(app).get('/api/v1/rooms')

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('rooms')
        expect(response.body.rooms).toHaveLength(2)
        expect(response.body).toHaveProperty('total', 2)
        expect(response.body).toHaveProperty('limit')
        expect(response.body).toHaveProperty('offset')
      })

      it('should support pagination', async () => {
        for (let i = 0; i < 5; i++) {
          await request(app).post('/api/v1/rooms').send({})
        }

        const response = await request(app).get('/api/v1/rooms?limit=2&offset=1')

        expect(response.status).toBe(200)
        expect(response.body.rooms).toHaveLength(2)
        expect(response.body.total).toBe(5)
        expect(response.body.limit).toBe(2)
        expect(response.body.offset).toBe(1)
      })
    })

    describe('GET /api/v1/rooms/:roomId', () => {
      it('should get room details', async () => {
        const createResponse = await request(app).post('/api/v1/rooms').send({})
        const roomId = createResponse.body.id

        const response = await request(app).get(`/api/v1/rooms/${roomId}`)

        expect(response.status).toBe(200)
        expect(response.body.id).toBe(roomId)
      })

      it('should return 404 for non-existent room', async () => {
        const response = await request(app).get('/api/v1/rooms/invalid123')

        expect(response.status).toBe(404)
        expect(response.body.error).toBe('ROOM_NOT_FOUND')
      })

      it('should reject invalid room ID format', async () => {
        const response = await request(app).get('/api/v1/rooms/invalid')

        expect(response.status).toBe(400)
      })
    })

    describe('DELETE /api/v1/rooms/:roomId', () => {
      it('should delete a room', async () => {
        const createResponse = await request(app).post('/api/v1/rooms').send({})
        const roomId = createResponse.body.id

        const response = await request(app).delete(`/api/v1/rooms/${roomId}`)

        expect(response.status).toBe(204)

        const getResponse = await request(app).get(`/api/v1/rooms/${roomId}`)
        expect(getResponse.status).toBe(404)
      })

      it('should return 404 when deleting non-existent room', async () => {
        const response = await request(app).delete('/api/v1/rooms/invalid123')

        expect(response.status).toBe(404)
      })
    })
  })

  describe('Code Management', () => {
    let roomId

    beforeEach(async () => {
      const response = await request(app).post('/api/v1/rooms').send({})
      roomId = response.body.id
    })

    describe('GET /api/v1/rooms/:roomId/code', () => {
      it('should get room code', async () => {
        const response = await request(app).get(`/api/v1/rooms/${roomId}/code`)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('code')
        expect(response.body).toHaveProperty('language')
        expect(response.body).toHaveProperty('timestamp')
        expect(response.body).toHaveProperty('version')
      })

      it('should return 404 for non-existent room', async () => {
        const response = await request(app).get('/api/v1/rooms/invalid123/code')

        expect(response.status).toBe(404)
      })
    })

    describe('PUT /api/v1/rooms/:roomId/code', () => {
      it('should update room code', async () => {
        const newCode = 'console.log("Updated")'
        const response = await request(app)
          .put(`/api/v1/rooms/${roomId}/code`)
          .send({
            code: newCode,
            language: 'javascript',
          })

        expect(response.status).toBe(200)
        expect(response.body.code).toBe(newCode)
        expect(response.body.version).toBe(1)

        const getResponse = await request(app).get(`/api/v1/rooms/${roomId}/code`)
        expect(getResponse.body.code).toBe(newCode)
      })

      it('should reject code that is too large', async () => {
        const largeCode = 'x'.repeat(60000)
        const response = await request(app)
          .put(`/api/v1/rooms/${roomId}/code`)
          .send({
            code: largeCode,
          })

        expect(response.status).toBe(400)
      })

      it('should reject missing code', async () => {
        const response = await request(app).put(`/api/v1/rooms/${roomId}/code`).send({})

        expect(response.status).toBe(400)
      })
    })
  })

  describe('Code Execution', () => {
    describe('POST /api/v1/code/execute', () => {
      it('should execute JavaScript code successfully', async () => {
        const response = await request(app)
          .post('/api/v1/code/execute')
          .send({
            code: 'console.log("Hello, World!")',
            language: 'javascript',
          })

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('success')
        expect(response.body).toHaveProperty('output')
        expect(response.body).toHaveProperty('executionTime')
        expect(response.body).toHaveProperty('exitCode')
      })

      it('should handle execution errors', async () => {
        const response = await request(app)
          .post('/api/v1/code/execute')
          .send({
            code: 'throw new Error("Test error")',
            language: 'javascript',
          })

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(false)
        expect(response.body.error).toBeTruthy()
      })

      it('should return error for unsupported language', async () => {
        const response = await request(app)
          .post('/api/v1/code/execute')
          .send({
            code: 'print("Hello")',
            language: 'python',
          })

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain('not yet implemented')
      })

      it('should reject invalid language', async () => {
        const response = await request(app)
          .post('/api/v1/code/execute')
          .send({
            code: 'console.log("test")',
            language: 'invalid',
          })

        expect(response.status).toBe(400)
      })

      it('should reject code that is too large', async () => {
        const response = await request(app)
          .post('/api/v1/code/execute')
          .send({
            code: 'x'.repeat(60000),
            language: 'javascript',
          })

        expect(response.status).toBe(400)
      })

      it('should reject invalid timeout', async () => {
        const response = await request(app)
          .post('/api/v1/code/execute')
          .send({
            code: 'console.log("test")',
            language: 'javascript',
            timeout: 50000,
          })

        expect(response.status).toBe(400)
      })
    })
  })

  describe('Session Management', () => {
    let roomId

    beforeEach(async () => {
      const response = await request(app).post('/api/v1/rooms').send({})
      roomId = response.body.id
    })

    describe('GET /api/v1/sessions/:roomId', () => {
      it('should get session info', async () => {
        const response = await request(app).get(`/api/v1/sessions/${roomId}`)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('roomId', roomId)
        expect(response.body).toHaveProperty('activeUsers')
        expect(response.body.activeUsers).toBeInstanceOf(Array)
        expect(response.body).toHaveProperty('createdAt')
        expect(response.body).toHaveProperty('lastActivity')
      })

      it('should return 404 for non-existent room', async () => {
        const response = await request(app).get('/api/v1/sessions/invalid123')

        expect(response.status).toBe(404)
      })
    })

    describe('POST /api/v1/sessions/:roomId/join', () => {
      it('should join a session', async () => {
        const response = await request(app)
          .post(`/api/v1/sessions/${roomId}/join`)
          .send({
            userName: 'John Doe',
          })

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('sessionId')
        expect(response.body).toHaveProperty('room')
        expect(response.body.room.id).toBe(roomId)

        const sessionResponse = await request(app).get(`/api/v1/sessions/${roomId}`)
        expect(sessionResponse.body.activeUsers).toHaveLength(1)
        expect(sessionResponse.body.activeUsers[0].userName).toBe('John Doe')
      })

      it('should join without userName', async () => {
        const response = await request(app)
          .post(`/api/v1/sessions/${roomId}/join`)
          .send({})

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('sessionId')
      })

      it('should return 404 for non-existent room', async () => {
        const response = await request(app)
          .post('/api/v1/sessions/invalid123/join')
          .send({})

        expect(response.status).toBe(404)
      })

      it('should reject userName that is too long', async () => {
        const response = await request(app)
          .post(`/api/v1/sessions/${roomId}/join`)
          .send({
            userName: 'x'.repeat(60),
          })

        expect(response.status).toBe(400)
      })
    })

    describe('POST /api/v1/sessions/:roomId/leave', () => {
      it('should leave a session', async () => {
        const joinResponse = await request(app)
          .post(`/api/v1/sessions/${roomId}/join`)
          .send({})
        const sessionId = joinResponse.body.sessionId

        const response = await request(app)
          .post(`/api/v1/sessions/${roomId}/leave`)
          .send({
            sessionId,
          })

        expect(response.status).toBe(204)

        const sessionResponse = await request(app).get(`/api/v1/sessions/${roomId}`)
        expect(sessionResponse.body.activeUsers).toHaveLength(0)
      })

      it('should return 404 for invalid session', async () => {
        const response = await request(app)
          .post(`/api/v1/sessions/${roomId}/leave`)
          .send({
            sessionId: 'invalid',
          })

        expect(response.status).toBe(404)
      })

      it('should require sessionId', async () => {
        const response = await request(app)
          .post(`/api/v1/sessions/${roomId}/leave`)
          .send({})

        expect(response.status).toBe(400)
      })
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/v1/unknown')

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('NOT_FOUND')
    })
  })
})
