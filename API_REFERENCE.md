# API Reference - Coding Interview Platform

This document provides a quick reference for the backend API endpoints defined in `openapi.yaml`.

## Base URLs

- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://api.codinginterviewplatform.com/v1`

## Authentication

Currently, the API does not require authentication. An `ApiKey` security scheme is defined but not enforced. This will be implemented in future versions.

## Quick Reference

### Health Check

```http
GET /health
```

Check if the API is running.

**Response**: `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00Z",
  "uptime": 3600
}
```

---

### Room Management

#### Create Room

```http
POST /rooms
Content-Type: application/json

{
  "language": "javascript",
  "initialCode": "// Start coding...",
  "expiresIn": 24
}
```

**Response**: `201 Created`
```json
{
  "id": "abc123XYZ_",
  "language": "javascript",
  "createdAt": "2025-01-15T10:00:00Z",
  "expiresAt": "2025-01-16T10:00:00Z",
  "activeUsers": 0,
  "codeSnippet": "// Start coding...",
  "shareUrl": "https://app.example.com/room/abc123XYZ_"
}
```

#### List Rooms

```http
GET /rooms?limit=50&offset=0
```

**Response**: `200 OK`
```json
{
  "rooms": [...],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

#### Get Room

```http
GET /rooms/{roomId}
```

**Response**: `200 OK` (Room object) or `404 Not Found`

#### Delete Room

```http
DELETE /rooms/{roomId}
```

**Response**: `204 No Content` or `404 Not Found`

---

### Code Management

#### Get Room Code

```http
GET /rooms/{roomId}/code
```

**Response**: `200 OK`
```json
{
  "code": "console.log('Hello');",
  "language": "javascript",
  "timestamp": "2025-01-15T10:30:00Z",
  "version": 5
}
```

#### Update Room Code

```http
PUT /rooms/{roomId}/code
Content-Type: application/json

{
  "code": "console.log('Hello, World!');",
  "language": "javascript"
}
```

**Response**: `200 OK` (CodeSnapshot object)

#### Execute Code

```http
POST /code/execute
Content-Type: application/json

{
  "code": "console.log('Hello, World!');",
  "language": "javascript",
  "timeout": 5000,
  "stdin": ""
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "output": "Hello, World!",
  "executionTime": 42,
  "memoryUsed": 1024000,
  "exitCode": 0
}
```

**Error Response**: `400 Bad Request`, `413 Payload Too Large`, `429 Too Many Requests`, or `500 Internal Server Error`

---

### Session Management

#### Get Session Info

```http
GET /sessions/{roomId}
```

**Response**: `200 OK`
```json
{
  "roomId": "abc123XYZ_",
  "activeUsers": [
    {
      "id": "user-123",
      "userName": "John Doe",
      "joinedAt": "2025-01-15T10:00:00Z",
      "isActive": true
    }
  ],
  "createdAt": "2025-01-15T09:00:00Z",
  "lastActivity": "2025-01-15T10:30:00Z"
}
```

#### Join Session

```http
POST /sessions/{roomId}/join
Content-Type: application/json

{
  "userName": "John Doe"
}
```

**Response**: `200 OK`
```json
{
  "sessionId": "session-xyz",
  "room": { ...Room object... }
}
```

#### Leave Session

```http
POST /sessions/{roomId}/leave
Content-Type: application/json

{
  "sessionId": "session-xyz"
}
```

**Response**: `204 No Content`

---

## Data Models

### Room

```typescript
{
  id: string              // Pattern: ^[a-zA-Z0-9_-]{10}$
  language: string        // Enum: javascript, python, java, cpp, go
  createdAt: string       // ISO 8601 datetime
  expiresAt: string       // ISO 8601 datetime
  activeUsers: number     // >= 0
  codeSnippet?: string
  shareUrl: string        // URI format
}
```

### CodeExecutionRequest

```typescript
{
  code: string            // Max 50,000 chars
  language: string        // Enum: javascript, python, java, cpp, go
  timeout?: number        // 100-30000 ms, default 5000
  stdin?: string          // Max 10,000 chars
}
```

### CodeExecutionResult

```typescript
{
  success: boolean
  output: string
  error?: string
  executionTime: number   // milliseconds
  memoryUsed?: number     // bytes
  exitCode?: number
}
```

### Error

```typescript
{
  error: string           // Error code
  message: string         // Human-readable message
  details?: object
  timestamp: string       // ISO 8601 datetime
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `ROOM_NOT_FOUND` | 404 | The requested room does not exist |
| `INVALID_REQUEST` | 400 | Request body validation failed |
| `CODE_TOO_LARGE` | 413 | Code exceeds maximum size limit |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `EXECUTION_ERROR` | 500 | Code execution failed |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## Rate Limits

Rate limits will be implemented in the backend:

- **Code Execution**: 10 requests per minute per IP
- **Room Creation**: 5 requests per minute per IP
- **General API**: 100 requests per minute per IP

---

## Validation Rules

### Room ID
- Pattern: `^[a-zA-Z0-9_-]{10}$`
- Example: `abc123XYZ_`

### Language
- Allowed values: `javascript`, `python`, `java`, `cpp`, `go`

### Code Size
- Maximum: 50,000 characters

### Timeout
- Minimum: 100 ms
- Maximum: 30,000 ms (30 seconds)
- Default: 5,000 ms (5 seconds)

### Room Expiration
- Minimum: 1 hour
- Maximum: 168 hours (7 days)
- Default: 24 hours

---

## WebSocket Support (Future)

Real-time collaboration will be enhanced with WebSocket support:

```
ws://localhost:3000/ws/rooms/{roomId}
```

WebSocket messages will handle:
- Real-time code synchronization
- User presence updates
- Cursor positions
- Chat messages (if implemented)

---

## Examples

### Complete Flow: Create Room and Execute Code

```bash
# 1. Create a room
curl -X POST http://localhost:3000/api/v1/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "initialCode": "console.log(\"Hello\");"
  }'

# Response: {"id": "abc123XYZ_", ...}

# 2. Execute code
curl -X POST http://localhost:3000/api/v1/code/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log(\"Hello, World!\");",
    "language": "javascript"
  }'

# Response: {"success": true, "output": "Hello, World!", ...}

# 3. Join the session
curl -X POST http://localhost:3000/api/v1/sessions/abc123XYZ_/join \
  -H "Content-Type: application/json" \
  -d '{"userName": "John"}'

# Response: {"sessionId": "session-xyz", "room": {...}}
```

---

## Notes for Implementation (Step 3)

1. **Code Execution Security**:
   - Use sandboxed environments (Docker containers, VMs, or specialized runtimes)
   - Implement timeout enforcement
   - Limit memory and CPU usage
   - Sanitize output

2. **Real-Time Sync**:
   - Consider keeping WebRTC for peer-to-peer when possible
   - Use WebSocket for server coordination
   - Implement operational transformation or CRDT for conflict resolution

3. **Data Persistence**:
   - Store rooms in Redis for fast access (with TTL)
   - Use PostgreSQL for permanent records
   - Implement room cleanup for expired sessions

4. **Scalability**:
   - Implement horizontal scaling with load balancer
   - Use Redis for session management
   - Consider message queue for code execution jobs

---

For the complete specification, see [openapi.yaml](./openapi.yaml).
