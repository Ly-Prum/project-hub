import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Manual } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'

const STATUSES = ['draft', 'review', 'published'] as const

const defaultForm = () => ({
  title: '', category: '', content: '', role: '', version: '1.0',
  status: 'draft' as Manual['status'],
})

export function Manuals({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<Manual[]>([])
  const [form, setForm] = useState(defaultForm())
  const [editing, setEditing] = useState<Manual | null>(null)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<Manual | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const load = async () => {
    const { data } = await supabase.from('manuals').select('*').eq('project_id', projectId).order('created_at')
    setItems(data ?? [])
  }
  useEffect(() => { load() }, [projectId])

  const openNew = () => { setForm(defaultForm()); setEditing(null); setOpen(true) }
  const openEdit = (item: Manual) => {
    setEditing(item)
    setForm({
      title: item.title, category: item.category ?? '', content: item.content ?? '',
      role: item.role ?? '', version: item.version, status: item.status,
    })
    setOpen(true)
  }

  const save = async () => {
    if (!form.title) return
    const payload = { ...form, category: form.category || null, content: form.content || null, role: form.role || null }
    if (editing) {
      await supabase.from('manuals').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('manuals').insert({ ...payload, project_id: projectId })
    }
    setOpen(false); load()
  }

  const remove = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await supabase.from('manuals').delete().eq('id', id); load()
  }

  const filtered = items.filter(i =>
    (filterStatus === 'all' || i.status === filterStatus) &&
    i.title.toLowerCase().includes(search.toLowerCase())
  )

  const inputCls = 'mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="検索..." className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none">
            <option value="all">すべて</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors">
          <span className="text-base leading-none">+</span> マニュアル追加
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="マニュアルが登録されていません" onAdd={openNew} addLabel="マニュアルを追加" />
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group cursor-pointer" onClick={() => setDetail(item)}>
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge value={item.status} />
                  {item.role && <Badge value={item.role} />}
                  <span className="text-xs text-gray-400">v{item.version}</span>
                  {item.category && <span className="text-xs text-gray-500">{item.category}</span>}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <button onClick={() => openEdit(item)} className="p-1 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                </button>
                <button onClick={() => remove(item.id)} className="p-1 text-gray-400 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {detail && (
        <Modal title={detail.title} onClose={() => setDetail(null)} size="lg">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge value={detail.status} />
              {detail.role && <Badge value={detail.role} />}
              <span className="text-xs text-gray-400">v{detail.version}</span>
              {detail.category && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{detail.category}</span>}
            </div>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 rounded-lg p-4 font-sans leading-relaxed">{detail.content ?? '（内容なし）'}</pre>
            </div>
          </div>
        </Modal>
      )}

      {open && (
        <Modal title={editing ? 'マニュアル編集' : 'マニュアル追加'} onClose={() => setOpen(false)} size="lg">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">タイトル *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">カテゴリ</label>
                <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">対象ロール</label>
                <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">バージョン</label>
                <input value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">ステータス</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Manual['status'] })} className={inputCls}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">内容</label>
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={10} className={`${inputCls} resize-y`} />
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
