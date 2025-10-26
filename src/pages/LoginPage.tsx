import { useState } from 'react'
import { AuthAPI } from '../lib/api'
import { toast } from 'sonner'
import { useNavigate, Link } from 'react-router-dom'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !password) {
      toast.error('请输入用户名和密码')
      return
    }
    try {
      setLoading(true)
      const { token } = await AuthAPI.login(username, password)
      localStorage.setItem('token', token)
      toast.success('登录成功')
      navigate('/chat')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h2 className="text-2xl font-semibold mb-4">登录</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button disabled={loading} className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50">
          {loading ? '登录中…' : '登录'}
        </button>
      </form>
      <p className="text-sm mt-3 text-slate-600">
        还没有账号？<Link to="/register" className="text-blue-600">去注册</Link>
      </p>
    </div>
  )
}




