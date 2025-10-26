import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (resp) => resp,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      // soft redirect
      if (!location.pathname.startsWith('/login')) {
        location.assign('/login')
      }
    }
    return Promise.reject(err)
  },
)

export type Chat = { id: number; userId: number; title: string }
export type Message = { id: number; chatId: number; role: string; content: string }
export type Document = {
  id: number
  title: string
  filename: string
  contentType: string
  sizeBytes: number
  storagePath: string
  createdBy: number
}

export const AuthAPI = {
  async login(username: string, password: string) {
    const { data } = await api.post<{ token: string }>('/auth/login', { username, password })
    return data
  },
  async register(username: string, password: string, isAdmin: boolean) {
    await api.post('/auth/register', { username, password, isAdmin })
  },
}

export const ChatAPI = {
  async create(title: string) {
    const { data } = await api.post<Chat>('/chat/create', { title })
    return data
  },
  async list() {
    const { data } = await api.get<Chat[]>('/chat/list')
    return data
  },
  async history(chatId: number) {
    const { data } = await api.get<Message[]>(`/chat/${chatId}/history`)
    return data
  },
  async send(chatId: number, content: string) {
    const { data } = await api.post<Message[]>(`/chat/${chatId}/send`, { content })
    return data
  },
}

export const DocsAPI = {
  async upload(title: string, file: File) {
    const form = new FormData()
    form.append('title', title)
    form.append('file', file)
    const { data } = await api.post<Document>('/docs/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  async list() {
    const { data } = await api.get<Document[]>('/docs')
    return data
  },
  async delete(id: number) {
    await api.delete(`/docs/${id}`)
  },
}




