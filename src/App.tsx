import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { supabase } from './lib/supabase'
import type { Project } from './types'
import { Sidebar } from './components/Sidebar'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { ProjectLayout } from './pages/project/ProjectLayout'
import { Modal } from './components/ui/Modal'

const defaultProjectForm = () => ({
  name: '', client_name: '', description: '', status: 'active' as Project['status'], start_date: '',
})

function App() {
  const { session, loading, signOut } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [newOpen, setNewOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Project | null>(null)
  const [pForm, setPForm] = useState(defaultProjectForm())

  const loadProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('created_at')
    setProjects(data ?? [])
  }

  useEffect(() => { if (session) loadProjects() }, [session])

  const openNew = () => { setPForm(defaultProjectForm()); setEditTarget(null); setNewOpen(true) }
  const openEdit = (p: Project) => {
    setEditTarget(p)
    setPForm({ name:p.name, client_name:p.client_name??'', description:p.description??'', status:p.status, start_date:p.start_date??'' })
    setNewOpen(true)
  }
  const saveProject = async () => {
    if (!pForm.name) return
    if (editTarget) {
      await supabase.from('projects').update({ ...pForm, updated_at: new Date().toISOString() }).eq('id', editTarget.id)
    } else {
      await supabase.from('projects').insert({ ...pForm })
    }
    setNewOpen(false); loadProjects()
  }
  const deleteProject = async (id: string) => {
    if (!confirm('プロジェクトを削除しますか？（関連データもすべて削除されます）')) return
    await supabase.from('projects').delete().eq('id', id); loadProjects()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">読み込み中...</div>
  if (!session) return <Login />

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-white overflow-hidden">
        <Sidebar projects={projects} onNewProject={openNew} onSignOut={signOut} />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard projects={projects} onNew={openNew} onDelete={deleteProject} onEdit={openEdit} />} />
            <Route path="/projects/:id/:tab" element={<ProjectLayout />} />
            <Route path="/projects/:id" element={<Navigate to="tasks" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {newOpen && (
          <Modal title={editTarget ? 'プロジェクト編集' : '新規プロジェクト'} onClose={() => setNewOpen(false)}>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">プロジェクト名 *</label>
                <input value={pForm.name} onChange={e => setPForm({...pForm,name:e.target.value})} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">クライアント名</label>
                <input value={pForm.client_name} onChange={e => setPForm({...pForm,client_name:e.target.value})} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">概要</label>
                <textarea value={pForm.description} onChange={e => setPForm({...pForm,description:e.target.value})} rows={3} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">ステータス</label>
                  <select value={pForm.status} onChange={e => setPForm({...pForm,status:e.target.value as Project['status']})} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
                    <option value="active">進行中</option>
                    <option value="paused">一時停止</option>
                    <option value="completed">完了</option>
                    <option value="archived">アーカイブ</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">開始日</label>
                  <input type="date" value={pForm.start_date} onChange={e => setPForm({...pForm,start_date:e.target.value})} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setNewOpen(false)} className="px-4 py-2 text-sm text-gray-600">キャンセル</button>
                <button onClick={saveProject} className="px-4 py-2 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8]">保存</button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </BrowserRouter>
  )
}

export default App
