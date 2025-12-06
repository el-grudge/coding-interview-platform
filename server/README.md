# Coding Interview Platform - Backend API

Express.js backend API for the collaborative coding interview platform.

## Features

- **RESTful API**: Complete REST API following OpenAPI 3.0 specification
- **Room Management**: Create, list, retrieve, and delete interview rooms
- **Code Execution**: Sandboxed JavaScript code execution using Worker Threads
- **Session Management**: Track active users in interview rooms
- **Validation**: Request validation using express-validator
- **Error Handling**: Centralized error handling with standardized responses
- **In-Memory Database**: Fast in-memory storage with automatic cleanup
- **CORS Support**: Configurable CORS for frontend integration
- **Comprehensive Tests**: 33 integration tests covering all endpoints

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5
- **Validation**: express-validator
- **Testing**: Jest + Supertest
- **Code Execution**: Worker Threads (Node.js native)

## Prerequisites

- Node.js v18 or higher
- npm v10 or higher

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your settings:
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

All 33 integration tests should pass, covering:
- Health check endpoint
- Room creation, listing, retrieval, and deletion
- Code management (get/update room code)
- Code execution with sandboxing
- Session join/leave functionality
- Input validation and error handling

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/rooms` | Create new room |
| GET | `/rooms` | List all rooms |
| GET | `/rooms/:roomId` | Get room details |
| DELETE | `/rooms/:roomId` | Delete room |
| GET | `/rooms/:roomId/code` | Get room code |
| PUT | `/rooms/:roomId/code` | Update room code |
| POST | `/code/execute` | Execute code |
| GET | `/sessions/:roomId` | Get session info |
| POST | `/sessions/:roomId/join` | Join session |
| POST | `/sessions/:roomId/leave` | Leave session |

See [API_REFERENCE.md](../API_REFERENCE.md) in the parent directory for detailed endpoint documentation.

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── index.js           # Configuration settings
│   ├── controllers/
│   │   ├── healthController.js    # Health check logic
│   │   ├── roomController.js      # Room management logic
│   │   ├── codeController.js      # Code execution logic
│   │   └── sessionController.js   # Session management logic
│   ├── middleware/
│   │   ├── errorHandler.js    # Error handling middleware
│   │   └── validators.js      # Request validation middleware
│   ├── models/
│   │   ├── Room.js            # Room data model
│   │   └── Session.js         # Session data model
│   ├── routes/
│   │   ├── health.js          # Health routes
│   │   ├── rooms.js           # Room routes
│   │   ├── code.js            # Code execution routes
│   │   └── sessions.js        # Session routes
│   ├── services/
│   │   ├── database.js        # In-memory database service
│   │   └── codeExecutor.js    # Code execution service
│   ├── app.js                 # Express app setup
│   └── index.js               # Server entry point
├── __tests__/
│   └── api.test.js            # Integration tests
├── .env.example               # Environment variables template
├── jest.config.js             # Jest configuration
├── package.json
└── README.md
```

## Code Execution

The backend uses Node.js Worker Threads to execute JavaScript code in a sandboxed environment:

- **Timeout Enforcement**: Configurable timeout (default: 5s, max: 30s)
- **Isolated Execution**: Code runs in separate worker threads
- **Console Capture**: Console.log output is captured and returned
- **Error Handling**: Runtime errors are caught and reported
- **Memory Safety**: Worker threads provide memory isolation

### Supported Languages

Currently:
- ✅ **JavaScript**: Full support with sandboxed execution
- ⏳ **Python**: Coming soon (WebAssembly)
- ⏳ **Java**: Coming soon
- ⏳ **C++**: Coming soon
- ⏳ **Go**: Coming soon

## Database

The backend currently uses an in-memory database with:

- **Automatic Cleanup**: Expired rooms are automatically removed
- **Session Tracking**: Inactive sessions are cleaned up after 5 minutes
- **Thread-Safe Operations**: All database operations are synchronous
- **Fast Performance**: No I/O overhead

### Future Enhancements
- PostgreSQL for persistent storage
- Redis for caching and session management
- WebSocket support for real-time updates

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

## Configuration

Default configuration values are in `src/config/index.js`:

```javascript
{
  room: {
    defaultExpirationHours: 24,
    maxExpirationHours: 168,
    idLength: 10,
  },
  code: {
    maxSize: 50000,
    maxStdinSize: 10000,
    defaultTimeout: 5000,
    maxTimeout: 30000,
    minTimeout: 100,
  },
  rateLimit: {
    codeExecution: 10,
    roomCreation: 5,
    general: 100,
  },
}
```

## Error Handling

All errors follow a standard format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `ROOM_NOT_FOUND` | 404 | Room does not exist |
| `SESSION_NOT_FOUND` | 404 | Session does not exist |
| `INVALID_REQUEST` | 400 | Validation failed |
| `INTERNAL_ERROR` | 500 | Server error |

## Validation Rules

### Room ID
- Pattern: `^[a-zA-Z0-9_-]{10}$`
- Example: `abc123XYZ_`

### Language
- Allowed: `javascript`, `python`, `java`, `cpp`, `go`

### Code Size
- Maximum: 50,000 characters

### Timeout
- Minimum: 100ms
- Maximum: 30,000ms
- Default: 5,000ms

### Room Expiration
- Minimum: 1 hour
- Maximum: 168 hours (7 days)
- Default: 24 hours

## Security Considerations

1. **Code Execution Sandboxing**: Worker threads provide isolation
2. **Input Validation**: All inputs are validated before processing
3. **Timeout Limits**: Code execution has strict timeout limits
4. **Size Limits**: Code and input size are limited
5. **CORS Configuration**: Configurable origin restrictions

## Development

### Adding New Routes

1. Create controller in `src/controllers/`
2. Create route file in `src/routes/`
3. Add validators in `src/middleware/validators.js`
4. Register route in `src/app.js`
5. Add tests in `__tests__/`

### Code Style

- ES Modules (import/export)
- Async/await for asynchronous operations
- Error handling with try/catch or middleware
- Validation with express-validator

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

### CORS Errors
```bash
# Update CORS_ORIGIN in .env to match frontend URL
CORS_ORIGIN=http://localhost:5173
```

### Tests Not Passing
```bash
# Ensure all dependencies are installed
npm install

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Future Roadmap

- [ ] PostgreSQL integration
- [ ] Redis for caching
- [ ] WebSocket support for real-time collaboration
- [ ] Rate limiting implementation
- [ ] User authentication
- [ ] Code execution for Python (WebAssembly)
- [ ] Docker support
- [ ] Prometheus metrics
- [ ] Logging with Winston

## License

MIT
