const variants: Record<string, string> = {
  active:        'bg-green-100 text-green-700',
  paused:        'bg-yellow-100 text-yellow-700',
  completed:     'bg-blue-100 text-blue-700',
  archived:      'bg-gray-100 text-gray-500',
  high:          'bg-red-100 text-red-700',
  medium:        'bg-yellow-100 text-yellow-700',
  low:           'bg-gray-100 text-gray-600',
  todo:          'bg-gray-100 text-gray-600',
  in_progress:   'bg-blue-100 text-blue-700',
  done:          'bg-green-100 text-green-700',
  cancelled:     'bg-gray-100 text-gray-400 line-through',
  draft:         'bg-gray-100 text-gray-600',
  review:        'bg-yellow-100 text-yellow-700',
  published:     'bg-green-100 text-green-700',
  pending:       'bg-yellow-100 text-yellow-700',
  answered:      'bg-green-100 text-green-700',
  followup_needed: 'bg-red-100 text-red-700',
  confirmed:     'bg-green-100 text-green-700',
  not_started:   'bg-gray-100 text-gray-600',
}

const labels: Record<string, string> = {
  active: '進行中', paused: '一時停止', completed: '完了', archived: 'アーカイブ',
  high: '高', medium: '中', low: '低',
  todo: '未着手', in_progress: '進行中', done: '完了', cancelled: 'キャンセル',
  draft: '下書き', review: 'レビュー中', published: '公開',
  pending: '未回答', answered: '回答済み', followup_needed: '要フォロー',
  confirmed: '確認済み', not_started: '未着手',
}

export function Badge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[value] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[value] ?? value}
    </span>
  )
}
