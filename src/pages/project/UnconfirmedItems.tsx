import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { UnconfirmedItem } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'

const STATUSES = ['pending','confirmed','cancelled'] as const
const defaultForm = () => ({
  title:'', description:'', raised_by:'', assigned_to:'', due_date:'',
  status: 'pending' as UnconfirmedItem['status'], answer:'',
})

export function UnconfirmedItems({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<UnconfirmedItem[]>([])
  const [form, setForm] = useState(defaultForm())
  const [editing, setEditing] = useState<UnconfirmedItem | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const load = async () => {
    const { data } = await supabase.from('unconfirmed_items').select('*').eq('project_id', projectId).order('created_at')
    setItems(data ?? [])
  }
  useEffect(() => { load() }, [projectId])

  const openNew = () => { setForm(defaultForm()); setEditing(null); setOpen(true) }
  const openEdit = (u: UnconfirmedItem) => {
    setEditing(u)
    setForm({ title:u.title, description:u.description??'', raised_by:u.raised_by??'', assigned_to:u.assigned_to??'', due_date:u.due_date??'', status:u.status, answer:u.answer??'' })
    setOpen(true)
  }
  const save = async () => {
    if (!form.title) return
    if (editing) { await supabase.from('unconfirmed_items').update(form).eq('id', editing.id) }
    else { await supabase.from('unconfirmed_items').insert({ ...form, project_id: projectId }) }
    setOpen(false); load()
  }
  const remove = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await supabase.from('unconfirmed_items').delete().eq('id', id); load()
  }

  const filtered = items.filter(u =>
    (filterStatus === 'all' || u.status === filterStatus) &&
    u.title.toLowerCase().includes(search.toLowerCase())
  )
  const pending = items.filter(u => u.status === 'pending').length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {pending > 0 && <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{pending}件 未確認</span>}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="検索..." className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none">
            <option value="all">すべて</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8]">
          <span className="text-base leading-none">+</span> 未確認事項追加
        </button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState message="未確認事項がありません" onAdd={openNew} addLabel="追加する" />
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.id} className={`p-4 bg-white border rounded-xl group transition-colors ${u.status === 'pending' ? 'border-red-200 hover:border-red-300' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900">{u.title}</p>
                    <Badge value={u.status} />
                  </div>
                  {u.description && <p className="text-xs text-gray-500 mb-1">{u.description}</p>}
                  <div className="flex gap-3 text-xs text-gray-400">
                    {u.raised_by && <span>起票: {u.raised_by}</span>}
                    {u.assigned_to && <span>確認先: {u.assigned_to}</span>}
                    {u.due_date && <span>期限: {u.due_date}</span>}
                  </div>
                  {u.answer && <p className="text-xs text-green-700 bg-green-50 rounded-lg px-2 py-1 mt-2">回答: {u.answer}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <button onClick={() => openEdit(u)} className="p-1 text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg></button>
                  <button onClick={() => remove(u.id)} className="p-1 text-gray-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {open && (
        <Modal title={editing ? '未確認事項を編集' : '未確認事項を追加'} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <div><label className="text-xs font-medium text-gray-600">内容 *</label><input value={form.title} onChange={e => setForm({...form,title:e.target.value})} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20" /></div>
            <div><label className="text-xs font-medium text-gray-600">詳細</label><textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} rows={2} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none resize-none" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-gray-600">起票者</label><input value={form.raised_by} onChange={e => setForm({...form,raised_by:e.target.value})} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-gray-600">確認先</label><input value={form.assigned_to} onChange={e => setForm({...form,assigned_to:e.target.value})} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-gray-600">期限</label><input type="date" value={form.due_date} onChange={e => setForm({...form,due_date:e.target.value})} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-gray-600">ステータス</label>
                <select value={form.status} onChange={e => setForm({...form,status:e.target.value as UnconfirmedItem['status']})} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div><label className="text-xs font-medium text-gray-600">回答・確認内容</label><textarea value={form.answer} onChange={e => setForm({...form,answer:e.target.value})} rows={2} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none resize-none" /></div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600">キャンセル</button>
              <button onClick={save} className="px-4 py-2 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8]">保存</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
