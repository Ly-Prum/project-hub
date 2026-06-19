import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Minute } from '../../types'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'

const defaultForm = () => ({
  date: new Date().toISOString().slice(0,10), title:'', attendees:[] as string[], content:'', decisions:'', next_actions:'',
})

export function Minutes({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<Minute[]>([])
  const [form, setForm] = useState(defaultForm())
  const [attendeesStr, setAttendeesStr] = useState('')
  const [editing, setEditing] = useState<Minute | null>(null)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<Minute | null>(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    const { data } = await supabase.from('minutes').select('*').eq('project_id', projectId).order('date', { ascending: false })
    setItems(data ?? [])
  }
  useEffect(() => { load() }, [projectId])

  const openNew = () => { setForm(defaultForm()); setAttendeesStr(''); setEditing(null); setOpen(true) }
  const openEdit = (m: Minute) => {
    setEditing(m)
    setForm({ date:m.date, title:m.title, attendees:m.attendees, content:m.content??'', decisions:m.decisions??'', next_actions:m.next_actions??'' })
    setAttendeesStr((m.attendees??[]).join('、'))
    setOpen(true)
  }

  const save = async () => {
    if (!form.title) return
    const payload = { ...form, attendees: attendeesStr.split(/[、,]/).map(s=>s.trim()).filter(Boolean) }
    if (editing) {
      await supabase.from('minutes').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('minutes').insert({ ...payload, project_id: projectId })
    }
    setOpen(false); load()
  }

  const remove = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await supabase.from('minutes').delete().eq('id', id); load()
  }

  const filtered = items.filter(m => m.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="議事録を検索..." className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-56 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20" />
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors">
          <span className="text-base leading-none">+</span> 議事録追加
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="議事録がありません" onAdd={openNew} addLabel="議事録を追加" />
      ) : (
        <div className="space-y-2">
          {filtered.map(m => (
            <div key={m.id} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group cursor-pointer" onClick={() => setDetail(m)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.date} {m.attendees?.length ? `・ ${m.attendees.join('、')}` : ''}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(m)} className="p-1 text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg></button>
                  <button onClick={() => remove(m.id)} className="p-1 text-gray-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button>
                </div>
              </div>
              {m.decisions && <p className="text-xs text-gray-500 mt-2 line-clamp-2">決定事項: {m.decisions}</p>}
            </div>
          ))}
        </div>
      )}

      {detail && (
        <Modal title={detail.title} onClose={() => setDetail(null)} size="lg">
          <div className="space-y-4 text-sm">
            <p className="text-gray-500">{detail.date} ・ 参加者: {(detail.attendees??[]).join('、') || 'なし'}</p>
            {detail.content && <div><p className="font-semibold text-gray-700 mb-1">内容</p><p className="text-gray-600 whitespace-pre-wrap">{detail.content}</p></div>}
            {detail.decisions && <div><p className="font-semibold text-gray-700 mb-1">決定事項</p><p className="text-gray-600 whitespace-pre-wrap">{detail.decisions}</p></div>}
            {detail.next_actions && <div><p className="font-semibold text-gray-700 mb-1">次のアクション</p><p className="text-gray-600 whitespace-pre-wrap">{detail.next_actions}</p></div>}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => { openEdit(detail); setDetail(null) }} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">編集</button>
              <button onClick={() => setDetail(null)} className="px-4 py-2 bg-[#1e3a8a] text-white text-sm rounded-lg">閉じる</button>
            </div>
          </div>
        </Modal>
      )}

      {open && (
        <Modal title={editing ? '議事録編集' : '議事録追加'} onClose={() => setOpen(false)} size="lg">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-gray-600">タイトル *</label><input value={form.title} onChange={e => setForm({...form,title:e.target.value})} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20" /></div>
              <div><label className="text-xs font-medium text-gray-600">日付</label><input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none" /></div>
            </div>
            <div><label className="text-xs font-medium text-gray-600">参加者（カンマ区切り）</label><input value={attendeesStr} onChange={e => setAttendeesStr(e.target.value)} placeholder="山本さん、西明さん、Yuka" className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20" /></div>
            <div><label className="text-xs font-medium text-gray-600">内容</label><textarea value={form.content} onChange={e => setForm({...form,content:e.target.value})} rows={4} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none resize-none" /></div>
            <div><label className="text-xs font-medium text-gray-600">決定事項</label><textarea value={form.decisions} onChange={e => setForm({...form,decisions:e.target.value})} rows={3} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none resize-none" /></div>
            <div><label className="text-xs font-medium text-gray-600">次のアクション</label><textarea value={form.next_actions} onChange={e => setForm({...form,next_actions:e.target.value})} rows={3} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none resize-none" /></div>
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
