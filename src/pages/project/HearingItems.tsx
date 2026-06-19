import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { HearingItem } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'

const STATUSES = ['pending', 'answered', 'followup_needed'] as const

const defaultForm = () => ({
  category: '', question: '', answer: '', answered_by: '', answered_at: '',
  status: 'pending' as HearingItem['status'],
})

export function HearingItems({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<HearingItem[]>([])
  const [form, setForm] = useState(defaultForm())
  const [editing, setEditing] = useState<HearingItem | null>(null)
  const [open, setOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  const load = async () => {
    const { data } = await supabase.from('hearing_items').select('*').eq('project_id', projectId).order('created_at')
    setItems(data ?? [])
  }
  useEffect(() => { load() }, [projectId])

  const openNew = () => { setForm(defaultForm()); setEditing(null); setOpen(true) }
  const openEdit = (item: HearingItem) => {
    setEditing(item)
    setForm({
      category: item.category ?? '', question: item.question,
      answer: item.answer ?? '', answered_by: item.answered_by ?? '',
      answered_at: item.answered_at ?? '', status: item.status,
    })
    setOpen(true)
  }

  const save = async () => {
    if (!form.question) return
    const payload = {
      ...form,
      answer: form.answer || null,
      answered_by: form.answered_by || null,
      answered_at: form.answered_at || null,
      category: form.category || null,
    }
    if (editing) {
      await supabase.from('hearing_items').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('hearing_items').insert({ ...payload, project_id: projectId })
    }
    setOpen(false); load()
  }

  const remove = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await supabase.from('hearing_items').delete().eq('id', id); load()
  }

  const filtered = items.filter(i => filterStatus === 'all' || i.status === filterStatus)
  const pendingCount = items.filter(i => i.status === 'pending').length

  const grouped = filtered.reduce<Record<string, HearingItem[]>>((acc, item) => {
    const key = item.category ?? '未分類'
    ;(acc[key] ??= []).push(item)
    return acc
  }, {})

  const inputCls = 'mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none">
            <option value="all">すべて</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {pendingCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {pendingCount}件 未回答
            </span>
          )}
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors">
          <span className="text-base leading-none">+</span> 質問追加
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="ヒアリング項目が登録されていません" onAdd={openNew} addLabel="質問を追加" />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, catItems]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">{category}</h3>
              <div className="space-y-2">
                {catItems.map(item => (
                  <div key={item.id} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge value={item.status} />
                        </div>
                        <p className="text-sm font-medium text-gray-900">{item.question}</p>
                        {item.answer && (
                          <div className="mt-2 pl-3 border-l-2 border-blue-200">
                            <p className="text-sm text-gray-600">{item.answer}</p>
                            {item.answered_by && <p className="text-xs text-gray-400 mt-1">回答者: {item.answered_by}{item.answered_at && ` ・ ${item.answered_at}`}</p>}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => openEdit(item)} className="p-1 text-gray-400 hover:text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                        </button>
                        <button onClick={() => remove(item.id)} className="p-1 text-gray-400 hover:text-red-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <Modal title={editing ? 'ヒアリング編集' : 'ヒアリング追加'} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">カテゴリ</label>
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">質問 *</label>
              <textarea value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} rows={3} className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">回答</label>
              <textarea value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} rows={3} className={`${inputCls} resize-none`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">回答者</label>
                <input value={form.answered_by} onChange={e => setForm({ ...form, answered_by: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">回答日</label>
                <input type="date" value={form.answered_at} onChange={e => setForm({ ...form, answered_at: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">ステータス</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as HearingItem['status'] })} className={inputCls}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
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
