export function normalize(text = '') {
  return text.toString().toLowerCase().trim()
}

function scoreMatch(query, text) {
  const q = normalize(query)
  const t = normalize(text)
  if (!q || !t) return 0
  if (t === q) return 100
  if (t.startsWith(q)) return 80
  if (t.includes(q)) return 60
  return 0
}

export function searchAll(query, tasks = [], habits = [], limit = 8) {
  const q = normalize(query)
  if (!q) return []

  const results = []

  // Tasks
  tasks.forEach(t => {
    const sTitle = scoreMatch(q, t.title)
    const sDesc = scoreMatch(q, t.description || '')
    const sCat = scoreMatch(q, t.category || '')
    const score = Math.max(sTitle * 2, sDesc, sCat) // title weighs more
    if (score > 0) {
      results.push({
        id: `task-${t.id}`,
        entityId: t.id,
        type: 'task',
        title: t.title,
        subtitle: t.category ? `Task • ${t.category}` : 'Task',
        score,
        route: '/tasks'
      })
    }
  })

  // Habits
  habits.forEach(h => {
    const sTitle = scoreMatch(q, h.title)
    const sDesc = scoreMatch(q, h.description || '')
    const sFreq = scoreMatch(q, h.frequency || '')
    const score = Math.max(sTitle * 2, sDesc, sFreq)
    if (score > 0) {
      results.push({
        id: `habit-${h.id}`,
        entityId: h.id,
        type: 'habit',
        title: h.title,
        subtitle: h.frequency ? `Habit • ${h.frequency}` : 'Habit',
        score,
        route: '/habits'
      })
    }
  })

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}