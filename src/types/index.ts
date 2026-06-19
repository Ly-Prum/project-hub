export interface Project {
  id: string
  name: string
  description: string | null
  status: 'active' | 'paused' | 'completed' | 'archived'
  client_name: string | null
  start_date: string | null
  created_at: string
  updated_at: string
}

export interface Minute {
  id: string
  project_id: string
  date: string
  title: string
  attendees: string[]
  content: string | null
  decisions: string | null
  next_actions: string | null
  created_at: string
}

export interface TaskInventoryItem {
  id: string
  project_id: string
  category: string | null
  task_name: string
  frequency: string | null
  responsible: string | null
  current_method: string | null
  issues: string | null
  improvement: string | null
  priority: 'high' | 'medium' | 'low'
  status: 'not_started' | 'in_progress' | 'completed'
  created_at: string
}

export interface HearingItem {
  id: string
  project_id: string
  category: string | null
  question: string
  answer: string | null
  answered_by: string | null
  answered_at: string | null
  status: 'pending' | 'answered' | 'followup_needed'
  created_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  assignee: string | null
  due_date: string | null
  priority: 'high' | 'medium' | 'low'
  status: 'todo' | 'in_progress' | 'done' | 'cancelled'
  created_at: string
}

export interface Document {
  id: string
  project_id: string
  title: string
  url: string
  category: string | null
  description: string | null
  created_at: string
}

export interface Manual {
  id: string
  project_id: string
  title: string
  category: string | null
  content: string | null
  role: string | null
  version: string
  status: 'draft' | 'review' | 'published'
  created_at: string
}

export interface FAQ {
  id: string
  project_id: string
  question: string
  answer: string | null
  category: string | null
  created_at: string
}

export interface Member {
  id: string
  project_id: string
  name: string
  role: string
  email: string | null
  notes: string | null
  created_at: string
}

export interface UnconfirmedItem {
  id: string
  project_id: string
  title: string
  description: string | null
  raised_by: string | null
  assigned_to: string | null
  due_date: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  answer: string | null
  created_at: string
}
