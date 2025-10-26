import { Toaster } from 'sonner'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom'
import './index.css'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'
import DocsPage from './pages/DocsPage'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  function logout() {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }
  return (
    <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/chat" className="font-semibold">RAG Chat</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/chat" className="hover:text-blue-600">聊天</Link>
          <Link to="/docs" className="hover:text-blue-600">文档</Link>
          {token && !['/login','/register'].includes(location.pathname) && (
            <button onClick={logout} className="ml-2 px-3 py-1.5 rounded border hover:bg-slate-50">退出登录</button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" />
      <div className="min-h-full bg-gradient-to-b from-white to-slate-50 text-slate-900">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/docs" element={<DocsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
