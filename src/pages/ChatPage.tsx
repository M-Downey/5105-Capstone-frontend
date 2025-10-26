import { useEffect, useMemo, useState } from 'react'
import { ChatAPI, type Chat, type Message } from '../lib/api'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [history, setHistory] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()

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

  async function onCreate() {
    try {
      setCreating(true)
      const title = `新的会话 ${new Date().toLocaleTimeString()}`
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
    // 乐观更新：先把消息插入本地历史
    const tempId = Date.now() * -1
    const optimistic: Message = { id: tempId, chatId: activeId, role: 'user', content }
    setHistory((prev) => [...prev, optimistic])
    setInput('')
    try {
      setSending(true)
      const all = await ChatAPI.send(activeId, content)
      setHistory(all)
    } catch (e: any) {
      // 回滚临时消息
      setHistory((prev) => prev.filter((m) => m.id !== tempId))
      toast.error(e?.response?.data?.message || '发送失败')
    } finally {
      setSending(false)
    }
  }

  const activeChat = useMemo(() => chats.find((c) => c.id === activeId) || null, [chats, activeId])

  return (
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-3 border rounded-lg bg-white p-3 h-[70vh] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">会话</h3>
          <button onClick={onCreate} disabled={creating} className="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">新建</button>
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
          {!chats.length && <div className="text-sm text-slate-500">暂无会话，点击右上角“新建”</div>}
        </div>
      </aside>

      <section className="col-span-9 border rounded-lg bg-white p-3 h-[70vh] flex flex-col">
        <div className="mb-2 font-semibold">{activeChat ? activeChat.title : '请选择会话'}</div>
        <div className="flex-1 overflow-auto space-y-3">
          {history.map((m) => (
            <div key={m.id} className={`max-w-[80%] px-3 py-2 rounded ${m.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-slate-100'}`}>
              <div className="text-xs opacity-70 mb-1">{m.role}</div>
              <div className="whitespace-pre-wrap break-words">{m.content}</div>
            </div>
          ))}
          {!history.length && <div className="text-sm text-slate-500">开始聊天吧～</div>}
        </div>
        <form onSubmit={onSend} className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            placeholder="输入消息，回车发送"
          />
          <button disabled={!activeId || sending} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">发送</button>
        </form>
      </section>
    </div>
  )
}


