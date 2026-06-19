import { useState } from 'react'
import type { Project } from '../types'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'

const STATUSES = ['active', 'paused', 'completed', 'archived'] as const

const defaultForm = () => ({
  name: '', client_name: '', description: '', start_date: '',
  status: 'active' as Project['status'],
})

interface Props {
  projects: Project[]
  onNew: () => void
  onDelete: (id: string) => void
  onEdit: (p: Project) => void
}

export function Dashboard({ projects, onNew, onDelete, onEdit }: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(defaultForm())
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const openNew = () => { setForm(defaultForm()); setEditingProject(null); setOpen(true); onNew() }
  const openEdit = (p: Project) => {
    setEditingProject(p)
    setForm({
      name: p.name, client_name: p.client_name ?? '', description: p.description ?? '',
      start_date: p.start_date ?? '', status: p.status,
    })
    setOpen(true)
  }

  const handleDelete = (id: string) => {
    if (!confirm('このプロジェクトを削除しますか？')) return
    onDelete(id)
  }

  const handleSave = () => {
    if (!form.name) return
    if (editingProject) {
      onEdit({ ...editingProject, ...form, client_name: form.client_name || null, description: form.description || null, start_date: form.start_date || null })
    }
    setOpen(false)
  }

  const inputCls = 'mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20'

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">プロジェクト一覧</h1>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length}件のプロジェクト</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors">
          <span className="text-lg leading-none">+</span> 新規作成
        </button>
      </div>

      {projects.length === 0 ? (
        <EmptyState message="プロジェクトがありません" onAdd={openNew} addLabel="プロジェクトを作成" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all group flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-gray-900 truncate">{p.name}</h2>
                  {p.client_name && <p className="text-xs text-gray-500 mt-0.5 truncate">{p.client_name}</p>}
                </div>
                <Badge value={p.status} />
              </div>

              {p.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{p.description}</p>
              )}

              {p.start_date && (
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  開始: {p.start_date}
                </div>
              )}

              <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                  編集
                </button>
                <button onClick={() => handleDelete(p.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && editingProject && (
        <Modal title="プロジェクト編集" onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">プロジェクト名 *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">クライアント名</label>
              <input value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">説明</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputCls} resize-none`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">ステータス</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Project['status'] })} className={inputCls}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">開始日</label>
                <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">キャンセル</button>
              <button onClick={handleSave} className="px-4 py-2 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8]">保存</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
