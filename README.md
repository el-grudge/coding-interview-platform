# Coding Interview Platform

A collaborative online coding interview platform built with React and Vite. This application allows multiple users to connect to the same session and edit code in real-time with syntax highlighting and browser-based code execution.

## Features

- **Create Shareable Interview Links**: Generate unique room IDs and share them with candidates
- **Real-Time Collaboration**: Multiple users can edit code simultaneously using WebRTC
- **Syntax Highlighting**: Support for multiple programming languages (JavaScript, Python, Java, C++, Go)
- **Browser-Based Code Execution**: Execute JavaScript and Python code directly in the browser using WebAssembly (Pyodide)
- **Monaco Editor**: Professional code editing experience powered by VS Code's editor
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Code Editor**: Monaco Editor
- **Real-Time Collaboration**: Yjs + WebRTC
- **Code Execution**: Pyodide (Python WASM)
- **Routing**: React Router DOM
- **Testing**: Vitest + React Testing Library
- **Styling**: CSS3

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5
- **Validation**: express-validator
- **Testing**: Jest + Supertest
- **Database**: In-memory (with auto-cleanup)
- **Code Execution**: Worker Threads

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (v10 or higher)

### Installation

#### Frontend Setup

1. Navigate to the project directory:
```bash
cd coding-interview-platform
```

2. Install dependencies:
```bash
npm install
```

#### Backend Setup

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

### Running the Application

#### Run Both Frontend and Backend (Recommended)

From the project root, run both client and server with a single command:

```bash
npm run dev
```

This will start:
- **Frontend** at `http://localhost:5173`
- **Backend API** at `http://localhost:3000/api/v1`

The output is color-coded (cyan for client, magenta for server) for easy identification.

#### Run Individually

**Frontend only**:
```bash
npm run dev:client
```

**Backend only**:
```bash
npm run dev:server
```

**Or run backend from server directory**:
```bash
cd server
npm run dev
```

### Building for Production

#### Frontend

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

#### Backend

Run in production mode:
```bash
cd server
npm start
```

### Running with Docker

#### Prerequisites
- Docker installed on your system
- Docker Compose (optional, for easier management)

#### Using Docker Compose (Recommended)

Build and run the entire application in a single container:

```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`

Stop the application:
```bash
docker-compose down
```

#### Using Docker directly

Build the image:
```bash
docker build -t coding-interview-platform .
```

Run the container:
```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e CORS_ORIGIN=http://localhost:3000 \
  coding-interview-platform
```

Stop the container:
```bash
docker ps  # Find container ID
docker stop <container-id>
```

## Deploying to Render

The application is configured for easy deployment to Render using the included `render.yaml` configuration.

### Prerequisites
- GitHub account
- Render account (free tier available at [render.com](https://render.com))
- Repository pushed to GitHub

### Deployment Steps

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Render**:
   - Go to [render.com](https://render.com) and sign in
   - Click "New +" and select "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**:
   - Set `CORS_ORIGIN` to your deployed application URL (e.g., `https://your-app.onrender.com`)
   - Other variables (NODE_ENV, PORT) are pre-configured

4. **Deploy**:
   - Click "Apply" to start the deployment
   - Render will build the Docker image and deploy your application
   - The build process takes approximately 5-10 minutes

5. **Access Your Application**:
   - Once deployed, you'll receive a URL like `https://coding-interview-platform.onrender.com`
   - The application will be available at this URL

### Important Notes

- **Free Tier Limitations**: Free tier services spin down after 15 minutes of inactivity. First request after inactivity may take 30-60 seconds to wake up.
- **Build Time**: Initial deployment builds both frontend and backend, which may take several minutes.
- **Automatic Deploys**: Render automatically redeploys when you push to your main branch.
- **Health Checks**: The service includes health checks at `/api/v1/health` to monitor application status.

### Manual Deployment (Alternative)

If you prefer not to use the Blueprint:

1. Create a new "Web Service" in Render
2. Connect your GitHub repository
3. Configure:
   - **Environment**: Docker
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `.`
   - **Health Check Path**: `/api/v1/health`
4. Add environment variables as listed above
5. Deploy

## Testing

### Frontend Tests

Run frontend tests (from project root):

```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

Run tests with UI:
```bash
npm run test:ui
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Backend Tests

Run backend tests (from `server` directory):

```bash
cd server
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### All Tests

Run all tests (frontend + backend) with a single command:

```bash
npm run test:all
```

This runs the frontend tests first, then the backend tests.

## Usage

### Creating a New Interview Session

1. Open the application in your browser
2. Click the **"Create Room"** button on the home page
3. A unique room ID will be generated and you'll be redirected to the interview room
4. Copy the share link from the header and send it to candidates

### Joining an Existing Interview Session

1. Open the application in your browser
2. Enter the room ID in the **"Join Existing Interview"** section
3. Click **"Join Room"** to enter the session

### Using the Code Editor

1. Select a programming language from the dropdown menu
2. Start typing code in the Monaco editor
3. All connected users will see real-time updates
4. Click **"Run Code"** to execute JavaScript code in the browser
5. View the output in the right panel

## Project Structure

```
coding-interview-platform/
├── public/              # Static assets
├── src/                 # Frontend source code
│   ├── pages/          # Page components
│   │   ├── Home.jsx            # Landing page
│   │   ├── Home.css
│   │   ├── InterviewRoom.jsx   # Collaborative editor room
│   │   └── InterviewRoom.css
│   ├── services/       # Frontend services
│   │   └── codeExecutor.js     # Browser-based code execution
│   ├── test/           # Test setup
│   │   └── setup.js
│   ├── App.jsx         # Main app component with routing
│   ├── App.css
│   ├── main.jsx        # Application entry point
│   └── index.css       # Global styles
├── server/              # Backend API server
│   ├── src/
│   │   ├── config/              # Configuration
│   │   ├── controllers/         # Request handlers
│   │   ├── middleware/          # Express middleware
│   │   ├── models/              # Data models
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   ├── app.js               # Express app
│   │   └── index.js             # Server entry
│   ├── __tests__/               # Backend tests
│   ├── .env.example             # Environment template
│   ├── package.json
│   └── README.md                # Backend documentation
├── openapi.yaml         # OpenAPI 3.0 specification
├── API_REFERENCE.md     # API documentation
├── Dockerfile           # Multi-stage Docker build
├── .dockerignore        # Docker build exclusions
├── docker-compose.yml   # Docker Compose configuration
├── render.yaml          # Render deployment configuration
├── package.json         # Frontend dependencies
├── vite.config.js       # Vite configuration
└── README.md            # Main documentation
```

## Test Coverage

### Frontend Tests (20 tests)

The frontend includes comprehensive integration tests covering:

- **App Navigation**: Testing routing between home and interview room pages
- **Home Page**: Creating new rooms and joining existing rooms
- **Interview Room**:
  - Real-time collaborative editing
  - Language selection
  - Share link generation and copying
  - Code execution (JavaScript)
  - Output display
  - Navigation

### Backend Tests (33 tests)

The backend includes comprehensive API tests covering:

- **Health Check**: API status and uptime
- **Room Management**:
  - Create, list, get, and delete rooms
  - Input validation and error handling
  - Pagination support
- **Code Management**:
  - Get and update room code
  - Code size validation
- **Code Execution**:
  - JavaScript execution with Worker Threads
  - Timeout enforcement
  - Error handling
  - Language support validation
- **Session Management**:
  - Join and leave sessions
  - Track active users
  - Session cleanup

## API Specification

The project includes a complete OpenAPI 3.0 specification (`openapi.yaml`) that defines the backend API contract for Step 3 implementation. The API specification includes:

### Endpoints

- **Health**: Health check endpoint
- **Rooms**: Create, list, get, and delete interview rooms
- **Code**: Get/update room code and execute code securely
- **Sessions**: Join/leave sessions and track active users

### Key Features in API Spec

- **Room Management**: Create unique rooms with configurable languages and expiration
- **Code Execution**: Server-side code execution with timeout and memory limits
- **Session Management**: Track active users and collaborative sessions
- **Validation**: Request/response schemas with validation rules
- **Error Handling**: Standardized error responses with details

### Viewing the API Documentation

You can view the API documentation using various tools:

1. **Swagger Editor**: Copy the contents of `openapi.yaml` to [editor.swagger.io](https://editor.swagger.io/)
2. **VS Code**: Install the "OpenAPI (Swagger) Editor" extension
3. **Swagger UI**: Run a local Swagger UI instance pointing to the spec file

## Completed Features

- ✅ **Step 1**: React + Vite frontend with real-time collaboration
- ✅ **Step 2**: OpenAPI 3.0 specification
- ✅ **Step 3**: Express.js backend with full API implementation
- ✅ **Python WASM Execution**: Pyodide integration for browser-based Python execution
- ✅ **Docker Containerization**: Multi-stage Docker build with frontend + backend in single container
- ✅ **Cloud Deployment**: Render deployment configuration with automatic builds

## Future Enhancements

- WebAssembly-based code execution for Java, C++, and Go
- PostgreSQL database integration
- Redis for caching and session management
- WebSocket support for enhanced real-time features
- User authentication and authorization
- CI/CD pipeline with GitHub Actions
- Rate limiting implementation
- Monitoring and logging

## Known Limitations

- **Language Support**: JavaScript and Python execution are implemented. Java, C++, and Go will be added in the future
- **Python Loading**: First Python execution requires downloading Pyodide (~10MB), which may take a few seconds
- **Database**: Using in-memory storage. Data is lost on server restart
- **Real-Time Sync**: Frontend uses peer-to-peer WebRTC. Backend API can be used for persistence and server-side coordination
- **Rate Limiting**: Defined in config but not yet enforced
- **Authentication**: No user authentication system yet

## Contributing

This is a learning project for building full-stack interview platforms. Contributions and suggestions are welcome!

## License

MIT
