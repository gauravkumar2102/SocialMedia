import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const signup  = (data)            => api.post('/auth/signup', data)
export const login   = (data)            => api.post('/auth/login', data)
export const getMe   = ()               => api.get('/auth/me')

export const getPosts       = (page = 1, limit = 10) => api.get(`/posts?page=${page}&limit=${limit}`)
export const createPost     = (formData)              => api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const likePost       = (id)                   => api.put(`/posts/${id}/like`)
export const commentOnPost  = (id, text)             => api.post(`/posts/${id}/comment`, { text })
export const deletePost     = (id)                   => api.delete(`/posts/${id}`)

export default api
