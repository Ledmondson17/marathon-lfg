import axios from 'axios'

// In development, VITE_API_URL is not set so requests go to /api
// which Vite proxies to localhost:5000.
// In production (Vercel), VITE_API_URL is set to the Railway backend URL.
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

export default instance
