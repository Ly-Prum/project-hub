import { useEffect, useState } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Project } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Tasks } from './Tasks'
import { Minutes } from './Minutes'
import { TaskInventory } from './TaskInventory'
import { HearingItems } from './HearingItems'
import { Documents } from './Documents'
import { Manuals } from './Manuals'
import { FAQs } from './FAQs'
import { Members } from './Members'
import { UnconfirmedItems } from './UnconfirmedItems'

const TABS = [
  { key: 'tasks',       label: 'タスク' },
  { key: 'minutes',     label: '議事録' },
  { key: 'inventory',   label: '業務棚卸し' },
  { key: 'hearing',     label: 'ヒアリング' },
  { key: 'documents',   label: '資料URL' },
  { key: 'manuals',     label: 'マニュアル' },
  { key: 'faqs',        label: 'FAQ' },
  { key: 'members',     label: '担当者' },
  { key: 'unconfirmed', label: '未確認事項' },
]

export function ProjectLayout() {
  const { id, tab } = useParams<{ id: string; tab: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    if (!id) return
    supabase.from('projects').select('*').eq('id', id).single()
      .then(({ data }) => setProject(data))
  }, [id])

  if (!id) return <Navigate to="/" />
  if (!project) return <div className="flex-1 flex items-center justify-center text-sm text-gray-400">読み込み中...</div>

  const currentTab = tab ?? 'tasks'

  const renderTab = () => {
    switch (currentTab) {
      case 'tasks':       return <Tasks projectId={id} />
      case 'minutes':     return <Minutes projectId={id} />
      case 'inventory':   return <TaskInventory projectId={id} />
      case 'hearing':     return <HearingItems projectId={id} />
      case 'documents':   return <Documents projectId={id} />
      case 'manuals':     return <Manuals projectId={id} />
      case 'faqs':        return <FAQs projectId={id} />
      case 'members':     return <Members projectId={id} />
      case 'unconfirmed': return <UnconfirmedItems projectId={id} />
      default: return <Navigate to={`/projects/${id}/tasks`} />
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Project header */}
      <div className="px-8 pt-6 pb-0 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
              <Badge value={project.status} />
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {project.client_name && <span>クライアント: {project.client_name}</span>}
              {project.start_date  && <span>開始: {project.start_date}</span>}
            </div>
            {project.description && <p className="text-xs text-gray-500 mt-1 max-w-2xl">{project.description}</p>}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 -mb-px overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => navigate(`/projects/${id}/${t.key}`)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                currentTab === t.key
                  ? 'border-[#1e3a8a] text-[#1e3a8a]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {renderTab()}
      </div>
    </div>
  )
}
