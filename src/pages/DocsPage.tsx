import { useEffect, useState } from 'react'
import { DocsAPI, type Document } from '../lib/api'
import { toast } from 'sonner'

export default function DocsPage() {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [docs, setDocs] = useState<Document[]>([])

  async function refresh() {
    try {
      const data = await DocsAPI.list()
      setDocs(data)
    } catch (e: any) {
      if (e?.response?.status === 403) {
        toast.info('需要管理员权限查看文档')
      } else {
        toast.error(e?.response?.data?.message || '加载失败')
      }
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function onUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !file) {
      toast.error('请填写标题并选择文件再上传')
      return
    }
    try {
      setUploading(true)
      await DocsAPI.upload(title, file)
      setTitle('')
      setFile(null)
      await refresh()
      toast.success('上传成功')
    } catch (e: any) {
      if (e?.response?.status === 403) {
        toast.error('需要管理员权限上传文档')
      } else {
        toast.error(e?.response?.data?.message || '上传失败')
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
      toast.error(e?.response?.data?.message || '删除失败')
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onUpload} className="border rounded-lg bg-white p-4 flex items-center gap-2">
        <input
          className="border rounded px-3 py-2"
          placeholder="文档标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="file"
          accept=".pdf,.txt,.md,.doc,.docx"
          onChange={(e) => {
            const f = e.target.files?.[0] || null
            setFile(f)
            if (f && !title) {
              const base = f.name.replace(/\.[^.]+$/, '')
              setTitle(base)
            }
          }}
        />
        <button disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{uploading ? '上传中…' : '上传'}</button>
      </form>

      <div className="border rounded-lg bg-white p-4">
        <h3 className="font-semibold mb-3">文档列表</h3>
        <div className="space-y-2">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center justify-between border rounded px-3 py-2">
              <div>
                <div className="font-medium">{d.title}</div>
                <div className="text-xs text-slate-500">{d.filename} · {(d.sizeBytes / 1024).toFixed(1)} KB</div>
              </div>
              <button onClick={() => onDelete(d.id)} className="text-sm text-red-600 hover:underline">删除</button>
            </div>
          ))}
          {!docs.length && <div className="text-sm text-slate-500">暂无数据或无权限</div>}
        </div>
      </div>
    </div>
  )
}


