import axios from 'axios'
import { API_URL } from '../lib/urls'

const api = axios.create({
  baseURL: API_URL,
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
export const getMe = async () => {
  const res = await api.get('/auth/me')
  return res.data
}

export const updateSettings = async (formData) => {
  const res = await api.put('/auth/settings', formData)
  return res.data
}

export const getPendingRewards = async () => {
  const res = await api.get('/rewards/pending')
  return res.data
}

export const redeemReward = async (rewardId) => {
  const res = await api.post(`/rewards/${rewardId}/redeem`)
  return res.data
}

export default api
