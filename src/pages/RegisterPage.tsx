import { useState } from 'react'
import { AuthAPI } from '../lib/api'
import { toast } from 'sonner'
import { useNavigate, Link } from 'react-router-dom'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
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
      await AuthAPI.register(username, password, isAdmin)
      toast.success('注册成功，请登录')
      navigate('/login')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h2 className="text-2xl font-semibold mb-4">注册</h2>
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
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
          管理员（可上传/管理文档）
        </label>
        <button disabled={loading} className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50">
          {loading ? '注册中…' : '注册'}
        </button>
      </form>
      <p className="text-sm mt-3 text-slate-600">
        已有账号？<Link to="/login" className="text-blue-600">去登录</Link>
      </p>
    </div>
  )
}




