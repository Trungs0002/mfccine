// Centralized API Base URL
// It reads from REACT_APP_API_URL environment variable for production (Vercel/Render)
// and defaults to localhost for development.
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
