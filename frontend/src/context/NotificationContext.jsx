import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useTask } from './TaskContext'
import { useHabit } from './HabitContext'
import { parseISO } from 'date-fns'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const { tasks } = useTask()
  const { getTodaysHabits, isHabitCompletedOnDate } = useHabit()
  const [notifications, setNotifications] = useState([])

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  const makeId = () => Math.random().toString(36).slice(2)

  const addNotification = (notif) => {
    setNotifications(prev => [
      {
        id: notif.id ?? makeId(),
        title: notif.title,
        description: notif.description ?? '',
        type: notif.type ?? 'info',
        createdAt: notif.createdAt ?? new Date().toISOString(),
        read: false
      },
      ...prev
    ])
  }

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  // Build notifications from tasks and habits
  useEffect(() => {
    const now = new Date()
    const list = []

    // Task: overdue
    tasks.filter(t => t.dueDate && t.status !== 'completed').forEach(t => {
      try {
        const dueDate = parseISO(t.dueDate)
        let isOverdue = false

        if (t.dueTime) {
          const due = new Date(`${t.dueDate}T${t.dueTime}:00`)
          isOverdue = due < now
        } else {
          // All-day: overdue if date is before today
          const taskDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
          const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          isOverdue = taskDateOnly < todayOnly
        }

        if (isOverdue) {
          list.push({
            id: `overdue-${t.id}`,
            title: 'Task overdue',
            description: `${t.title} is overdue`,
            type: 'warning',
            createdAt: t.updatedAt || t.dueDate,
            read: false
          })
        }
      } catch (_) {}
    })

    // Task: due soon (next 2 hours)
    tasks.filter(t => t.dueDate === todayStr && t.dueTime && t.status !== 'completed').forEach(t => {
      try {
        const due = new Date(`${t.dueDate}T${t.dueTime}:00`)
        const diffMin = Math.round((due - now) / 60000)
        if (diffMin > 0 && diffMin <= 120) {
          list.push({
            id: `due-soon-${t.id}`,
            title: 'Task due soon',
            description: `${t.title} is due in ${diffMin} min`,
            type: 'reminder',
            createdAt: new Date().toISOString(),
            read: false
          })
        }
      } catch (_) {}
    })

    // Habits: today reminders (not completed)
    try {
      const todays = getTodaysHabits()
      todays.forEach(h => {
        const done = isHabitCompletedOnDate(h.id, todayStr)
        if (!done) {
          list.push({
            id: `habit-reminder-${h.id}-${todayStr}`,
            title: 'Habit reminder',
            description: `Don’t forget: ${h.title}`,
            type: 'reminder',
            createdAt: new Date().toISOString(),
            read: false
          })
        }
      })
    } catch (_) {}

    // Merge: keep existing read state if same id already present
    setNotifications(prev => {
      const prevById = new Map(prev.map(n => [n.id, n]))
      const merged = list.map(n => prevById.get(n.id) ? { ...n, read: prevById.get(n.id).read } : n)
      // Also keep any custom notifications previously added (e.g., timer complete)
      const custom = prev.filter(n => !merged.find(m => m.id === n.id))
      // Sort newest first
      return [...custom, ...merged].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    })
  }, [tasks, getTodaysHabits, isHabitCompletedOnDate, todayStr])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => useContext(NotificationContext)