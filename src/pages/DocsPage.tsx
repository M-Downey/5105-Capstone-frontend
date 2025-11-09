import { useEffect, useState, useRef } from 'react'
import { DocsAPI, type Document } from '../lib/api'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export default function DocsPage() {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [docs, setDocs] = useState<Document[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function refresh() {
    try {
      const data = await DocsAPI.list()
      setDocs(data)
    } catch (e: any) {
      if (e?.response?.status === 403) {
        toast.info(t('docs.needAdmin'))
      } else {
        toast.error(e?.response?.data?.message || t('docs.loadFail'))
      }
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function onUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !file) {
      toast.error(t('docs.needInfo'))
      return
    }
    try {
      setUploading(true)
      await DocsAPI.upload(title, file)
      setTitle('')
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      await refresh()
      toast.success(t('docs.uploadSuccess'))
    } catch (e: any) {
      if (e?.response?.status === 403) {
        toast.error(t('docs.needAdmin'))
      } else {
        toast.error(e?.response?.data?.message || t('docs.uploadFail'))
      }
    } finally {
      setUploading(false)
    }
  }

  async function onDelete(id: number) {
    try {
      await DocsAPI.delete(id)
      await refresh()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t('docs.deleteFail'))
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onUpload} className="border rounded-lg bg-white p-4 flex items-center gap-2">
        <input
          className="border rounded px-3 py-2"
          placeholder={t('docs.title')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.doc,.docx,.html,.htm"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] || null
            setFile(f)
            if (f && !title) {
              const base = f.name.replace(/\.[^.]+$/, '')
              setTitle(base)
            }
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 border rounded hover:bg-slate-50"
        >
          {file ? file.name : t('docs.selectFile')}
        </button>
        <button disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{uploading ? t('docs.uploading') : t('docs.upload')}</button>
      </form>

      <div className="border rounded-lg bg-white p-4">
        <h3 className="font-semibold mb-3">{t('docs.list')}</h3>
        <div className="space-y-2">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center justify-between border rounded px-3 py-2">
              <div>
                <div className="font-medium">{d.title}</div>
                <div className="text-xs text-slate-500">{d.filename} · {(d.sizeBytes / 1024).toFixed(1)} KB</div>
              </div>
              <button onClick={() => onDelete(d.id)} className="text-sm text-red-600 hover:underline">{t('docs.delete')}</button>
            </div>
          ))}
          {!docs.length && <div className="text-sm text-slate-500">{t('docs.none')}</div>}
        </div>
      </div>
    </div>
  )
}


