import axios from 'axios'

const API_BASE_URL = 'http://localhost:8024'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor Request: Menyematkan JWT Token secara otomatis
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

// Interceptor Response: Menstandarisasi respons dan menangkap status error umum
api.interceptors.response.use(
  (response) => {
    return response.data; // Server mengembalikan respons terstruktur seperti { success, message, data, status }
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      // Logout otomatis jika token kedaluwarsa atau tidak valid
      if (status === 401 && localStorage.getItem('token')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      
      // Mengambil pesan error khusus jika dikembalikan dari backend
      const errMsg = data?.message || error.message || 'An error occurred'
      return Promise.reject({ status, message: errMsg, data })
    }
    
    return Promise.reject({ status: 500, message: 'Server is unreachable. Please check backend services.' })
  }
)

export default api
