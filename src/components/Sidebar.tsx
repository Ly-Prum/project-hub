import { Link, useParams } from 'react-router-dom'
import type { Project } from '../types'

interface Props {
  projects: Project[]
  onNewProject: () => void
  onSignOut: () => void
}

const statusDot: Record<string, string> = {
  active: 'bg-green-400', paused: 'bg-yellow-400',
  completed: 'bg-blue-400', archived: 'bg-gray-300',
}

export function Sidebar({ projects, onNewProject, onSignOut }: Props) {
  const { id } = useParams()

  return (
    <aside className="w-60 flex-shrink-0 h-screen flex flex-col bg-gray-50 border-r border-gray-200">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1e3a8a] flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-900">Project Hub</span>
        </div>
      </div>

      {/* Projects */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">プロジェクト</span>
          <button onClick={onNewProject} className="text-gray-400 hover:text-gray-600 transition-colors" title="新規プロジェクト">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
        <div className="space-y-0.5">
          {projects.map(p => (
            <Link
              key={p.id}
              to={`/projects/${p.id}/tasks`}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                id === p.id
                  ? 'bg-[#1e3a8a]/10 text-[#1e3a8a] font-medium'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[p.status]}`} />
              <span className="truncate">{p.name}</span>
            </Link>
          ))}
          {projects.length === 0 && (
            <p className="text-xs text-gray-400 px-2 py-2">プロジェクトなし</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          ログアウト
        </button>
      </div>
    </aside>
  )
}
