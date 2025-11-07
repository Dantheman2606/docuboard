# Local Setup Guide

## Prerequisites

Before running DocuBoard locally, ensure you have:

- **Node.js** - Version 18.x or higher
- **npm** or **yarn** - Package manager
- **MongoDB** - Running instance (local or MongoDB Atlas)
- **Git** - For cloning the repository

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd docuboard
```

### 2. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the `frontend` directory:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Environment Variables Explained:**
- `NEXT_PUBLIC_API_URL` - Backend API endpoint (Express server)

### 4. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd ../backend
npm install
```

### 5. Backend Environment Configuration

Create a `.env` file in the `backend` directory:

```
PORT=5000
MONGODB_URI=<YOUR_MONGO_URI>
```

**Backend Environment Variables:**
- `PORT` - Express server port (also serves WebSocket at `/collab` endpoint)
- `MONGODB_URI` - MongoDB connection string

**Note:** The WebSocket collaboration server runs on the same port as the Express API, using the `/collab` endpoint.

### 6. Database Setup (Optional)

To seed the database with sample data:

```bash
cd backend
node seed.js
```

This creates:
- Sample users with different roles
- Example projects
- Demo documents and kanban boards

## Running the Application

### Start Backend Server

You need to run **one** backend server that handles both API and WebSocket:

**Terminal 1 - Express API + WebSocket Server:**
```bash
cd backend
npm start
```
Runs on `http://localhost:5000` (API) and `ws://localhost:5000/collab` (WebSocket)

### Start Frontend

**Terminal 2 - Next.js Development Server:**
```bash
cd frontend
npm run dev
```
Runs on `http://localhost:3000`

## Accessing the Application

1. Open browser and navigate to `http://localhost:3000`
2. Create an account or login
3. Create a new project or access seeded projects
4. Start collaborating!

## Development Workflow

### Hot Reload
Both frontend and backend support hot reload during development:
- Frontend: Next.js Fast Refresh
- Backend: Restart manually or use nodemon

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

**Backend:**
```bash
cd backend
npm start
```

## Common Issues & Solutions



### MongoDB Connection Error
- Ensure MongoDB is running
- Verify `MONGODB_URI` in backend `.env`
- Check MongoDB service status

### WebSocket Connection Failed
- Ensure backend server is running (`npm start` in backend folder)
- Verify `NEXT_PUBLIC_WS_URL` in frontend `.env.local`
- Check that it points to `ws://localhost:5000` (same port as API)
- Check firewall settings

### Dependencies Installation Failed
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall
- Ensure Node.js version compatibility

## Browser Support

Recommended browsers for optimal experience:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)


