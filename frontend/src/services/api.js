import axios from 'axios'

const API_BASE_URL = 'http://localhost:8024'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT Token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config;
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Standardize responses and capture common error statuses
api.interceptors.response.use(
  (response) => {
    return response.data; // Server returns responses structured with { success, message, data, status }
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      // Auto-logout user on expired or invalid token
      if (status === 401 && localStorage.getItem('token')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      
      // Extract custom error message if returned from backend
      const errMsg = data?.message || error.message || 'An error occurred'
      return Promise.reject({ status, message: errMsg, data })
    }
    
    return Promise.reject({ status: 500, message: 'Server is unreachable. Please check backend services.' })
  }
)

export default api
