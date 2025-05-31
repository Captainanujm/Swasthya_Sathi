# Healthcare Platform

A comprehensive MERN-based healthcare web application designed for doctors, patients, and healthcare administrators.

## Features

- **Multi-role System**: Separate interfaces for doctors, patients, and admins
- **Doctor Profiles**: Multi-step profile creation with admin approval workflow
- **Patient Health Records**: Digital health ID with QR code
- **Real-time Chat**: Secure communication between patients and doctors
- **Admin Dashboard**: Comprehensive analytics and doctor approval management
- **Modern UI**: Powered by React, shadcn/ui, and Framer Motion
- **NEW: AI-powered document summarization for medical reports**

## Tech Stack

- **Frontend**: React (Vite), TypeScript, shadcn/ui, Framer Motion, Socket.io-client
- **Backend**: Node.js, Express, MongoDB, Socket.io
- **Authentication**: JWT
- **Tools**: QR Code generation, PDF generation

## Setup Instructions

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Set up environment variables:
   - Create `.env` in the backend directory
   - Create `.env.local` in the frontend directory

3. Start development servers:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Start production server:
   ```bash
   npm start
   ```

## Project Structure

- `/frontend`: React application with Vite
- `/backend`: Express API server
- `/frontend/src/components`: Reusable UI components
- `/frontend/src/pages`: Main application pages
- `/backend/controllers`: API route handlers
- `/backend/models`: MongoDB schema models
- `/backend/routes`: API route definitions
- `/backend/middleware`: Authentication and authorization middleware

### Environment Variables

The project requires the following environment variables:

**Backend (.env file in the backend directory)**

```
# Server configuration
PORT=5000

# Database configuration
MONGODB_URI=mongodb://localhost:27017/healthcare-platform

# JWT configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# File uploads
FILE_UPLOAD_PATH=uploads

# ML Services
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

### Hugging Face API Key Setup

To use the document summarization feature:

1. Create an account on [Hugging Face](https://huggingface.co/)
2. Generate an API key in your Hugging Face account settings
3. Add the API key to your backend `.env` file as `HUGGINGFACE_API_KEY` 