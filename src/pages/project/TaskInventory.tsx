import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { TaskInventoryItem } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'

const PRIORITIES = ['high', 'medium', 'low'] as const
const STATUSES = ['not_started', 'in_progress', 'completed'] as const

const defaultForm = () => ({
  task_name: '', category: '', frequency: '', responsible: '',
  current_method: '', issues: '', improvement: '',
  priority: 'medium' as TaskInventoryItem['priority'],
  status: 'not_started' as TaskInventoryItem['status'],
})

export function TaskInventory({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<TaskInventoryItem[]>([])
  const [form, setForm] = useState(defaultForm())
  const [editing, setEditing] = useState<TaskInventoryItem | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')

  const load = async () => {
    const { data } = await supabase.from('task_inventory').select('*').eq('project_id', projectId).order('created_at')
    setItems(data ?? [])
  }
  useEffect(() => { load() }, [projectId])

  const openNew = () => { setForm(defaultForm()); setEditing(null); setOpen(true) }
  const openEdit = (item: TaskInventoryItem) => {
    setEditing(item)
    setForm({
      task_name: item.task_name, category: item.category ?? '', frequency: item.frequency ?? '',
      responsible: item.responsible ?? '', current_method: item.current_method ?? '',
      issues: item.issues ?? '', improvement: item.improvement ?? '',
      priority: item.priority, status: item.status,
    })
    setOpen(true)
  }

  const save = async () => {
    if (!form.task_name) return
    if (editing) {
      await supabase.from('task_inventory').update({ ...form }).eq('id', editing.id)
    } else {
      await supabase.from('task_inventory').insert({ ...form, project_id: projectId })
    }
    setOpen(false); load()
  }

  const remove = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await supabase.from('task_inventory').delete().eq('id', id); load()
  }

  const filtered = items.filter(i =>
    (filterPriority === 'all' || i.priority === filterPriority) &&
    i.task_name.toLowerCase().includes(search.toLowerCase())
  )

  const inputCls = 'mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="検索..." className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20" />
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none">
            <option value="all">すべての優先度</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors">
          <span className="text-base leading-none">+</span> 業務追加
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="業務整理表が登録されていません" onAdd={openNew} addLabel="業務を追加" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">業務名</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">カテゴリ</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">頻度</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">担当者</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">優先度</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">ステータス</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                  <td className="py-2.5 px-3 font-medium text-gray-900">{item.task_name}</td>
                  <td className="py-2.5 px-3 text-gray-500">{item.category ?? '—'}</td>
                  <td className="py-2.5 px-3 text-gray-500">{item.frequency ?? '—'}</td>
                  <td className="py-2.5 px-3 text-gray-500">{item.responsible ?? '—'}</td>
                  <td className="py-2.5 px-3"><Badge value={item.priority} /></td>
                  <td className="py-2.5 px-3"><Badge value={item.status} /></td>
                  <td className="py-2.5 px-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                      </button>
                      <button onClick={() => remove(item.id)} className="p-1 text-gray-400 hover:text-red-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal title={editing ? '業務編集' : '業務追加'} onClose={() => setOpen(false)} size="lg">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600">業務名 *</label>
                <input value={form.task_name} onChange={e => setForm({ ...form, task_name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">カテゴリ</label>
                <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">頻度</label>
                <input value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} placeholder="例：毎日・週次" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">担当者</label>
                <input value={form.responsible} onChange={e => setForm({ ...form, responsible: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">現在の方法</label>
                <input value={form.current_method} onChange={e => setForm({ ...form, current_method: e.target.value })} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600">課題</label>
                <textarea value={form.issues} onChange={e => setForm({ ...form, issues: e.target.value })} rows={2} className={`${inputCls} resize-none`} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600">改善案</label>
                <textarea value={form.improvement} onChange={e => setForm({ ...form, improvement: e.target.value })} rows={2} className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">優先度</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as TaskInventoryItem['priority'] })} className={inputCls}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">ステータス</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as TaskInventoryItem['status'] })} className={inputCls}>
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
