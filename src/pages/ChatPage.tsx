import { useEffect, useMemo, useState, useRef } from 'react'
import { ChatAPI, type Chat, type Message } from '../lib/api'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function ChatPage() {
  const { t } = useTranslation()
  const [chats, setChats] = useState<Chat[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [history, setHistory] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    refreshChats()
  }, [])

  async function refreshChats() {
    try {
      const data = await ChatAPI.list()
      setChats(data)
      if (data.length && !activeId) {
        setActiveId(data[0].id)
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '获取会话失败')
    }
  }

  useEffect(() => {
    if (activeId) {
      ChatAPI.history(activeId)
        .then(setHistory)
        .catch((e) => toast.error(e?.response?.data?.message || '获取历史失败'))
    } else {
      setHistory([])
    }
  }, [activeId])

  // 自动滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [history])

  async function onCreate() {
    try {
      setCreating(true)
      const title = `${t('chat.list')} ${new Date().toLocaleTimeString()}`
      const chat = await ChatAPI.create(title)
      await refreshChats()
      setActiveId(chat.id)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '创建会话失败')
    } finally {
      setCreating(false)
    }
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !activeId) return
    const content = input.trim()
    // 乐观更新：先把用户消息插入本地历史
    const tempUserId = Date.now() * -1
    const tempAssistantId = Date.now() * -1 - 1
    const userMessage: Message = { id: tempUserId, chatId: activeId, role: 'user', content }
    const assistantMessage: Message = { id: tempAssistantId, chatId: activeId, role: 'assistant', content: '' }
    setHistory((prev) => [...prev, userMessage, assistantMessage])
    setInput('')
    setSending(true)
    
    try {
      // 调用 send 接口获取完整响应
      const allMessages = await ChatAPI.send(activeId, content)
      
      // 找到最后一条 assistant 消息（AI回复）
      const assistantResponse = allMessages.filter(m => m.role === 'assistant').pop()
      const fullContent = assistantResponse?.content || ''
      
      // 如果内容为空，直接显示完整历史
      if (!fullContent) {
        setHistory(allMessages)
        setSending(false)
        return
      }
      
      // 实现假的流式响应：逐字符显示
      let currentIndex = 0
      const typingSpeed = 20 // 每个字符的延迟（毫秒），可以调整速度
      
      const typeNextChar = () => {
        if (currentIndex < fullContent.length) {
          const displayedContent = fullContent.slice(0, currentIndex + 1)
          setHistory((prev) => {
            const updated = prev.map((m) =>
              m.id === tempAssistantId ? { ...m, content: displayedContent } : m
            )
            return updated
          })
          currentIndex++
          
          // 自动滚动到底部
          requestAnimationFrame(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
            }
          })
          
          // 继续下一个字符
          typingTimerRef.current = setTimeout(typeNextChar, typingSpeed)
        } else {
          // 打字完成，刷新历史记录以获取数据库中的完整消息（包含正确的ID）
          typingTimerRef.current = null
          setSending(false)
          ChatAPI.history(activeId)
            .then(setHistory)
            .catch((e) => {
              toast.error(e?.response?.data?.message || '获取历史失败')
              // 如果刷新失败，保持当前状态
            })
        }
      }
      
      // 开始打字效果
      typeNextChar()
      
    } catch (e: any) {
      // 发生错误，清理定时器并回滚临时消息
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
        typingTimerRef.current = null
      }
      setHistory((prev) => prev.filter((m) => m.id !== tempUserId && m.id !== tempAssistantId))
      setSending(false)
      toast.error(e?.response?.data?.message || e?.message || t('chat.sendFail'))
    }
  }

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
    }
  }, [])

  const activeChat = useMemo(() => chats.find((c) => c.id === activeId) || null, [chats, activeId])

  return (
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-3 border rounded-lg bg-white p-3 h-[70vh] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{t('chat.list')}</h3>
          <button onClick={onCreate} disabled={creating} className="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{t('chat.create')}</button>
        </div>
        <div className="overflow-auto space-y-1">
          {chats.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left px-3 py-2 rounded border ${activeId === c.id ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-slate-50'}`}
            >
              <div className="text-sm font-medium truncate">{c.title}</div>
              <div className="text-xs text-slate-500">#{c.id}</div>
            </button>
          ))}
          {!chats.length && <div className="text-sm text-slate-500">{t('chat.none')}</div>}
        </div>
      </aside>

      <section className="col-span-9 border rounded-lg bg-white p-3 h-[70vh] flex flex-col">
        <div className="mb-2 font-semibold">{activeChat ? activeChat.title : t('chat.pick')}</div>
        <div className="flex-1 overflow-auto space-y-3">
          {history.map((m) => (
            <div key={m.id} className={`max-w-[80%] px-3 py-2 rounded ${m.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-slate-100'}`}>
              <div className="text-xs opacity-70 mb-1">{m.role}</div>
              <div className="whitespace-pre-wrap break-words">{m.content || (m.role === 'assistant' && sending ? '...' : '')}</div>
            </div>
          ))}
          {!history.length && <div className="text-sm text-slate-500">{t('chat.start')}</div>}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={onSend} className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            placeholder={t('chat.placeholder')}
          />
          <button disabled={!activeId || sending} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{t('chat.send')}</button>
        </form>
      </section>
    </div>
  )
}


