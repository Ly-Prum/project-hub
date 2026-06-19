import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Task } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'

const PRIORITIES = ['high','medium','low'] as const
const STATUSES   = ['todo','in_progress','done','cancelled'] as const

const defaultForm = () => ({
  title:'', description:'', assignee:'', due_date:'',
  priority: 'medium' as Task['priority'], status: 'todo' as Task['status'],
})

export function Tasks({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<Task[]>([])
  const [form, setForm] = useState(defaultForm())
  const [editing, setEditing] = useState<Task | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const load = async () => {
    const { data } = await supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at')
    setItems(data ?? [])
  }
  useEffect(() => { load() }, [projectId])

  const openNew  = () => { setForm(defaultForm()); setEditing(null); setOpen(true) }
  const openEdit = (t: Task) => { setEditing(t); setForm({title:t.title,description:t.description??'',assignee:t.assignee??'',due_date:t.due_date??'',priority:t.priority,status:t.status}); setOpen(true) }

  const save = async () => {
    if (!form.title) return
    if (editing) {
      await supabase.from('tasks').update({ ...form }).eq('id', editing.id)
    } else {
      await supabase.from('tasks').insert({ ...form, project_id: projectId })
    }
    setOpen(false); load()
  }

  const remove = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await supabase.from('tasks').delete().eq('id', id); load()
  }

  const toggleStatus = async (t: Task) => {
    const next = t.status === 'todo' ? 'in_progress' : t.status === 'in_progress' ? 'done' : 'todo'
    await supabase.from('tasks').update({ status: next }).eq('id', t.id); load()
  }

  const filtered = items.filter(t =>
    (filterStatus === 'all' || t.status === filterStatus) &&
    t.title.toLowerCase().includes(search.toLowerCase())
  )

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
          <span className="text-base leading-none">+</span> タスク追加
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="タスクがありません" onAdd={openNew} addLabel="タスクを追加" />
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group">
              <button onClick={() => toggleStatus(t)} className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${t.status === 'done' ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-[#1e3a8a]'}`}>
                {t.status === 'done' && <svg className="w-full h-full text-white p-0.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${t.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge value={t.priority} />
                  <Badge value={t.status} />
                  {t.assignee && <span className="text-xs text-gray-500">@{t.assignee}</span>}
                  {t.due_date && <span className="text-xs text-gray-500">期限: {t.due_date}</span>}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(t)} className="p-1 text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg></button>
                <button onClick={() => remove(t.id)} className="p-1 text-gray-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <Modal title={editing ? 'タスク編集' : 'タスク追加'} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <div><label className="text-xs font-medium text-gray-600">タイトル *</label><input value={form.title} onChange={e => setForm({...form,title:e.target.value})} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20" /></div>
            <div><label className="text-xs font-medium text-gray-600">詳細</label><textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} rows={3} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 resize-none" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-gray-600">担当者</label><input value={form.assignee} onChange={e => setForm({...form,assignee:e.target.value})} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20" /></div>
              <div><label className="text-xs font-medium text-gray-600">期限</label><input type="date" value={form.due_date} onChange={e => setForm({...form,due_date:e.target.value})} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20" /></div>
              <div><label className="text-xs font-medium text-gray-600">優先度</label>
                <select value={form.priority} onChange={e => setForm({...form,priority:e.target.value as Task['priority']})} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-medium text-gray-600">ステータス</label>
                <select value={form.status} onChange={e => setForm({...form,status:e.target.value as Task['status']})} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
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
