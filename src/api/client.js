import axios from 'axios'

const api = axios.create({
  baseURL: 'https://fidapp-backend-production.up.railway.app/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fidapp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password })
  return res.data
}

export const getStats = async () => {
  const res = await api.get('/stats')
  return res.data
}
export const generateQrCode = async () => {
  const res = await api.post('/qrcode/generate')
  return res.data
}

export const getMyQrCodes = async () => {
  const res = await api.get('/qrcode/mine')
  return res.data
}

export default api