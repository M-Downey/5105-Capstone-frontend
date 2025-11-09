import { useState } from 'react'
import { AuthAPI } from '../lib/api'
import { toast } from 'sonner'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function RegisterPage() {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
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
      await AuthAPI.register(username, password, isAdmin)
      toast.success(t('auth.registerSuccess'))
      navigate('/login')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t('auth.registerFail'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h2 className="text-2xl font-semibold mb-4">{t('auth.register')}</h2>
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
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
          {t('auth.isAdmin')}
        </label>
        <button disabled={loading} className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50">
          {loading ? `${t('auth.register')}…` : t('auth.register')}
        </button>
      </form>
      <p className="text-sm mt-3 text-slate-600">
        <Link to="/login" className="text-blue-600">{t('auth.gotoLogin')}</Link>
      </p>
    </div>
  )
}






