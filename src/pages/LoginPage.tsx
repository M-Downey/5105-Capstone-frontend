import { useState } from 'react'
import { AuthAPI } from '../lib/api'
import { toast } from 'sonner'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function LoginPage() {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !password) {
      toast.error(t('auth.needNamePwd'))
      return
    }
    try {
      setLoading(true)
      const { token } = await AuthAPI.login(username, password)
      localStorage.setItem('token', token)
      toast.success(t('auth.loginSuccess'))
      navigate('/chat')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t('auth.loginFail'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h2 className="text-2xl font-semibold mb-4">{t('auth.login')}</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder={t('auth.username')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          placeholder={t('auth.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button disabled={loading} className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50">
          {loading ? `${t('auth.login')}…` : t('auth.login')}
        </button>
      </form>
      <p className="text-sm mt-3 text-slate-600">
        <Link to="/register" className="text-blue-600">{t('auth.gotoRegister')}</Link>
      </p>
    </div>
  )
}






