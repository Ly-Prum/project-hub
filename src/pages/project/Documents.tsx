import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Document } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'

const defaultForm = () => ({ title: '', url: '', category: '', description: '' })

export function Documents({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<Document[]>([])
  const [form, setForm] = useState(defaultForm())
  const [editing, setEditing] = useState<Document | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const load = async () => {
    const { data } = await supabase.from('documents').select('*').eq('project_id', projectId).order('created_at')
    setItems(data ?? [])
  }
  useEffect(() => { load() }, [projectId])

  const openNew = () => { setForm(defaultForm()); setEditing(null); setOpen(true) }
  const openEdit = (item: Document) => {
    setEditing(item)
    setForm({ title: item.title, url: item.url, category: item.category ?? '', description: item.description ?? '' })
    setOpen(true)
  }

  const save = async () => {
    if (!form.title || !form.url) return
    const payload = { ...form, category: form.category || null, description: form.description || null }
    if (editing) {
      await supabase.from('documents').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('documents').insert({ ...payload, project_id: projectId })
    }
    setOpen(false); load()
  }

  const remove = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await supabase.from('documents').delete().eq('id', id); load()
  }

  const filtered = items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()))

  const inputCls = 'mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="検索..." className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20" />
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors">
          <span className="text-base leading-none">+</span> ドキュメント追加
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="ドキュメントが登録されていません" onAdd={openNew} addLabel="ドキュメントを追加" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all group flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(item)} className="p-1 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                  </button>
                  <button onClick={() => remove(item.id)} className="p-1 text-gray-400 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                  </button>
                </div>
              </div>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-900 hover:text-[#1e3a8a] transition-colors line-clamp-2 mb-1">
                {item.title}
              </a>
              {item.category && <div className="mb-2"><Badge value={item.category} /></div>}
              {item.description && <p className="text-xs text-gray-500 line-clamp-2 mt-auto">{item.description}</p>}
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:underline truncate">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                <span className="truncate">{item.url}</span>
              </a>
            </div>
          ))}
        </div>
      )}

      {open && (
        <Modal title={editing ? 'ドキュメント編集' : 'ドキュメント追加'} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">タイトル *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">URL *</label>
              <input type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">カテゴリ</label>
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">説明</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputCls} resize-none`} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">キャンセル</button>
              <button onClick={save} className="px-4 py-2 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8]">保存</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
