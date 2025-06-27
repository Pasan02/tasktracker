import { createContext, useContext, useState, useEffect } from 'react'

const HabitContext = createContext()

export const useHabit = () => {
  const context = useContext(HabitContext)
  if (!context) {
    throw new Error('useHabit must be used within a HabitProvider')
  }
  return context
}

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([])
  const [habitCompletions, setHabitCompletions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load habits from localStorage
    const savedHabits = localStorage.getItem('habits')
    const savedCompletions = localStorage.getItem('habitCompletions')
    
    if (savedHabits) {
      try {
        setHabits(JSON.parse(savedHabits))
      } catch (error) {
        console.error('Error parsing saved habits:', error)
      }
    } else {
      // Initialize with mock data
      const mockHabits = [
        {
          id: 1,
          title: 'Morning meditation',
          description: 'Start the day with 10 minutes of mindfulness',
          frequency: 'daily',
          targetDays: [1, 2, 3, 4, 5, 6, 0], // All days
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: 2,
          title: 'Write in journal',
          description: 'Reflect on the day and write thoughts',
          frequency: 'daily',
          targetDays: [1, 2, 3, 4, 5, 6, 0], // All days
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: 3,
          title: 'Exercise',
          description: '30 minutes of physical activity',
          frequency: 'weekly',
          targetDays: [1, 3, 5], // Mon, Wed, Fri
          createdAt: new Date().toISOString(),
          isActive: true
        }
      ]
      setHabits(mockHabits)
      localStorage.setItem('habits', JSON.stringify(mockHabits))
    }

    if (savedCompletions) {
      try {
        setHabitCompletions(JSON.parse(savedCompletions))
      } catch (error) {
        console.error('Error parsing saved completions:', error)
      }
    }
    
    setIsLoading(false)
  }, [])

  const saveHabits = (updatedHabits) => {
    localStorage.setItem('habits', JSON.stringify(updatedHabits))
  }

  const saveCompletions = (updatedCompletions) => {
    localStorage.setItem('habitCompletions', JSON.stringify(updatedCompletions))
  }

  const addHabit = (habitData) => {
    const newHabit = {
      id: Date.now(),
      ...habitData,
      createdAt: new Date().toISOString(),
      isActive: true
    }
    const updatedHabits = [...habits, newHabit]
    setHabits(updatedHabits)
    saveHabits(updatedHabits)
    return newHabit
  }

  const updateHabit = (habitId, updates) => {
    const updatedHabits = habits.map(habit =>
      habit.id === habitId ? { ...habit, ...updates } : habit
    )
    setHabits(updatedHabits)
    saveHabits(updatedHabits)
  }

  const deleteHabit = (habitId) => {
    const updatedHabits = habits.filter(habit => habit.id !== habitId)
    const updatedCompletions = habitCompletions.filter(completion => completion.habitId !== habitId)
    
    setHabits(updatedHabits)
    setHabitCompletions(updatedCompletions)
    saveHabits(updatedHabits)
    saveCompletions(updatedCompletions)
  }

  const markHabitComplete = (habitId, date = null) => {
    const completionDate = date || new Date().toISOString().split('T')[0]
    const existingCompletion = habitCompletions.find(
      completion => completion.habitId === habitId && completion.date === completionDate
    )

    if (existingCompletion) {
      // Already completed, remove completion
      const updatedCompletions = habitCompletions.filter(
        completion => !(completion.habitId === habitId && completion.date === completionDate)
      )
      setHabitCompletions(updatedCompletions)
      saveCompletions(updatedCompletions)
    } else {
      // Mark as complete
      const newCompletion = {
        id: Date.now(),
        habitId,
        date: completionDate,
        completedAt: new Date().toISOString()
      }
      const updatedCompletions = [...habitCompletions, newCompletion]
      setHabitCompletions(updatedCompletions)
      saveCompletions(updatedCompletions)
    }
  }

  const isHabitCompletedOnDate = (habitId, date) => {
    return habitCompletions.some(
      completion => completion.habitId === habitId && completion.date === date
    )
  }

  const getHabitStreak = (habitId) => {
    const today = new Date()
    let streak = 0
    let currentDate = new Date(today)

    while (true) {
      const dateString = currentDate.toISOString().split('T')[0]
      if (isHabitCompletedOnDate(habitId, dateString)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const getTodaysHabits = () => {
    const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
    return habits.filter(habit => 
      habit.isActive && habit.targetDays.includes(today)
    )
  }

  const getHabitCompletionRate = (habitId, days = 30) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    let totalDays = 0
    let completedDays = 0
    const habit = habits.find(h => h.id === habitId)

    if (!habit) return 0

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay()
      if (habit.targetDays.includes(dayOfWeek)) {
        totalDays++
        if (isHabitCompletedOnDate(habitId, d.toISOString().split('T')[0])) {
          completedDays++
        }
      }
    }

    return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
  }

  const value = {
    habits,
    habitCompletions,
    isLoading,
    addHabit,
    updateHabit,
    deleteHabit,
    markHabitComplete,
    isHabitCompletedOnDate,
    getHabitStreak,
    getTodaysHabits,
    getHabitCompletionRate
  }

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  )
}
