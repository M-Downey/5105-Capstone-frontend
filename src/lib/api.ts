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
  async stream(
    chatId: number,
    content: string,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (error: Error) => void
  ) {
    const token = localStorage.getItem('token')
    
    try {
      // 使用 fetch 发送 POST 请求，因为 EventSource 不支持 POST
      const response = await fetch(`/api/chat/${chatId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
      }

      if (!response.body) {
        throw new Error('Response body is not readable')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let currentEventType = ''
      let currentData = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          // 流结束，处理剩余数据
          if (currentEventType === 'token' && currentData !== '') {
            onToken(currentData)
          }
          onDone()
          return
        }

        // 解码数据并添加到缓冲区
        buffer += decoder.decode(value, { stream: true })
        
        // 按行处理 SSE 格式
        // SSE 格式: event: <type>\ndata: <data>\n\n
        let newlineIndex
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).replace(/\r$/, '')
          buffer = buffer.slice(newlineIndex + 1)

          if (line.startsWith('event: ')) {
            // 如果之前有未处理的 token 数据，先处理它
            if (currentEventType === 'token' && currentData !== '') {
              onToken(currentData)
              currentData = ''
            }
            currentEventType = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            const data = line.slice(6)
            // 对于 token 事件，立即处理每个数据块以提高实时性
            if (currentEventType === 'token') {
              // 立即处理 token，不等待空行
              if (data !== null && data !== undefined) {
                onToken(data)
              }
            } else {
              // 对于其他事件类型，保存数据
              currentData = data
            }
          } else if (line.trim() === '') {
            // 空行表示一个完整事件的结束
            if (currentEventType === 'done') {
              onDone()
              return
            }
            // 重置状态准备下一个事件
            // 注意：token 事件的数据已经在收到 data 时立即处理了
            currentEventType = ''
            currentData = ''
          }
          // 忽略其他行（如 id: 或 retry: 等）
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)))
    }
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






