import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Member } from '../../types'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'

const defaultForm = () => ({ name: '', role: '', email: '', notes: '' })

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?'
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500',
]

function avatarColor(name: string) {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffff
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export function Members({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<Member[]>([])
  const [form, setForm] = useState(defaultForm())
  const [editing, setEditing] = useState<Member | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const load = async () => {
    const { data } = await supabase.from('members').select('*').eq('project_id', projectId).order('created_at')
    setItems(data ?? [])
  }
  useEffect(() => { load() }, [projectId])

  const openNew = () => { setForm(defaultForm()); setEditing(null); setOpen(true) }
  const openEdit = (item: Member) => {
    setEditing(item)
    setForm({ name: item.name, role: item.role, email: item.email ?? '', notes: item.notes ?? '' })
    setOpen(true)
  }

  const save = async () => {
    if (!form.name || !form.role) return
    const payload = { ...form, email: form.email || null, notes: form.notes || null }
    if (editing) {
      await supabase.from('members').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('members').insert({ ...payload, project_id: projectId })
    }
    setOpen(false); load()
  }

  const remove = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await supabase.from('members').delete().eq('id', id); load()
  }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.role.toLowerCase().includes(search.toLowerCase())
  )

  const inputCls = 'mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="名前・役割で検索..." className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-56 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20" />
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors">
          <span className="text-base leading-none">+</span> メンバー追加
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="メンバーが登録されていません" onAdd={openNew} addLabel="メンバーを追加" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-full ${avatarColor(item.name)} flex items-center justify-center text-white font-bold text-lg`}>
                  {getInitial(item.name)}
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
              <p className="text-sm font-semibold text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.role}</p>
              {item.email && (
                <a href={`mailto:${item.email}`} className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  {item.email}
                </a>
              )}
              {item.notes && <p className="mt-2 text-xs text-gray-400 line-clamp-2">{item.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {open && (
        <Modal title={editing ? 'メンバー編集' : 'メンバー追加'} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">名前 *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">役割 *</label>
              <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="例：PMO・開発リード" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">メールアドレス</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">備考</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className={`${inputCls} resize-none`} />
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
