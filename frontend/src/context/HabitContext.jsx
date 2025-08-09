import { createContext, useContext, useState, useEffect } from 'react'
import habitService from '../services/habitService'

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
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        setIsLoading(true)
        console.log('Fetching habits and completions...')
        
        // Fetch both habits and completions in parallel
        const [habitsData, completionsData] = await Promise.all([
          habitService.getAllHabits(),
          habitService.getHabitCompletions()
        ])
        
        console.log('Habits fetched:', habitsData)
        console.log('Completions fetched:', completionsData)
        
        setHabits(habitsData)
        setHabitCompletions(completionsData)
        setError(null)
      } catch (err) {
        console.error('Error fetching habits:', err)
        setError('Failed to load habits')
        
        // Fallback to local storage if API fails
        const savedHabits = localStorage.getItem('habits')
        const savedCompletions = localStorage.getItem('habitCompletions')
        
        if (savedHabits) {
          try { 
            const parsedHabits = JSON.parse(savedHabits)
            console.log('Using saved habits:', parsedHabits)
            setHabits(parsedHabits) 
          } catch (error) { 
            console.error('Error parsing saved habits:', error) 
          }
        }
        
        if (savedCompletions) {
          try { 
            const parsedCompletions = JSON.parse(savedCompletions)
            console.log('Using saved completions:', parsedCompletions)
            setHabitCompletions(parsedCompletions) 
          } catch (error) { 
            console.error('Error parsing saved completions:', error) 
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchHabits()
  }, [])

  // Save to localStorage as backup
  const saveHabits = (updatedHabits) => {
    localStorage.setItem('habits', JSON.stringify(updatedHabits))
  }

  const saveCompletions = (updatedCompletions) => {
    localStorage.setItem('habitCompletions', JSON.stringify(updatedCompletions))
  }

  const addHabit = async (habitData) => {
    try {
      console.log('Adding habit:', habitData)
      const newHabit = await habitService.createHabit(habitData)
      const updatedHabits = [...habits, newHabit]
      setHabits(updatedHabits)
      saveHabits(updatedHabits)
      console.log('Habit added successfully:', newHabit)
      return newHabit
    } catch (error) {
      console.error('Error adding habit:', error)
      setError('Failed to add habit')
      throw error
    }
  }

  const updateHabit = async (habitId, updates) => {
    try {
      console.log('Updating habit:', habitId, updates)
      const updatedHabit = await habitService.updateHabit(habitId, updates)
      const updatedHabits = habits.map(habit =>
        habit.id == habitId ? updatedHabit : habit
      )
      setHabits(updatedHabits)
      saveHabits(updatedHabits)
      console.log('Habit updated successfully:', updatedHabit)
      return updatedHabit
    } catch (error) {
      console.error('Error updating habit:', error)
      setError('Failed to update habit')
      throw error
    }
  }

  const deleteHabit = async (habitId) => {
    try {
      console.log('Deleting habit:', habitId)
      await habitService.deleteHabit(habitId)
      const updatedHabits = habits.filter(habit => habit.id != habitId)
      const updatedCompletions = habitCompletions.filter(completion => completion.habitId != habitId)
      
      setHabits(updatedHabits)
      setHabitCompletions(updatedCompletions)
      saveHabits(updatedHabits)
      saveCompletions(updatedCompletions)
      console.log('Habit deleted successfully')
    } catch (error) {
      console.error('Error deleting habit:', error)
      setError('Failed to delete habit')
      throw error
    }
  }

  const markHabitComplete = async (habitId, date = null) => {
    try {
      const completionDate = date || new Date().toISOString().split('T')[0]
      console.log('Toggling habit completion (API):', habitId, completionDate)

      const result = await habitService.toggleHabitCompletion(habitId, completionDate)

      if (result.action === 'removed') {
        const updated = habitCompletions.filter(
          c => !(c.habitId == habitId && c.date === (result.date || completionDate))
        )
        setHabitCompletions(updated)
        saveCompletions(updated)
        console.log('Habit completion removed')
      } else if (result.action === 'added' && result.completion) {
        const normalized = {
          id: result.completion.id,
          habitId: result.completion.habitId,
          date: result.completion.date,
          completed: true
        }
        const updated = [...habitCompletions, normalized]
        setHabitCompletions(updated)
        saveCompletions(updated)
        console.log('Habit completion added:', normalized)
      } else {
        console.warn('Unexpected toggle response:', result)
      }
    } catch (error) {
      console.error('Error toggling habit completion:', error)
      setError('Failed to update habit completion')
      throw error
    }
  }

  const isHabitCompletedOnDate = (habitId, date) => {
    const result = habitCompletions.some(
      completion => completion.habitId == habitId && completion.date === date
    )
    console.log(`Checking completion for habit ${habitId} on ${date}:`, result)
    return result
  }

  const getHabitStreak = (habitId) => {
    const habit = habits.find(h => h.id == habitId)
    if (!habit) return 0
    
    // Get all completions for this habit
    const completions = habitCompletions
      .filter(completion => completion.habitId == habitId)
      .map(completion => completion.date)
      .sort()
    
    if (completions.length === 0) return 0
    
    // Calculate streak
    const today = new Date().toISOString().split('T')[0]
    let currentStreak = 0
    let date = new Date(today)
    
    while (true) {
      const dateString = date.toISOString().split('T')[0]
      
      // If this date has a completion, increase streak
      if (completions.includes(dateString)) {
        currentStreak++
        date.setDate(date.getDate() - 1)
      } 
      // If this is a day the habit should be completed but wasn't, break
      else if (habit.targetDays && habit.targetDays.includes(date.getDay())) {
        break
      }
      // If not a target day, just go back one more day
      else {
        date.setDate(date.getDate() - 1)
      }
      
      // Don't go too far back (limit to 365 days)
      if (currentStreak > 365) break
    }
    
    return currentStreak
  }

  const getTodaysHabits = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    
    return habits.filter(habit => {
      // If habit has no target days, assume it's daily
      if (!habit.targetDays || habit.targetDays.length === 0) {
        return true
      }
      return habit.targetDays.includes(dayOfWeek)
    })
  }

  const getHabitCompletionRate = (habitId, startDate, endDate) => {
    const habit = habits.find(h => h.id == habitId)
    if (!habit) return 0
    
    startDate = startDate || new Date(new Date().setDate(new Date().getDate() - 30))
    endDate = endDate || new Date()
    
    let totalDays = 0
    let completedDays = 0
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay()
      if (!habit.targetDays || habit.targetDays.length === 0 || habit.targetDays.includes(dayOfWeek)) {
        totalDays++
        if (isHabitCompletedOnDate(habitId, d.toISOString().split('T')[0])) {
          completedDays++
        }
      }
    }

    return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
  }

  // Add this method to your HabitContext value
  const archiveHabit = async (habitId) => {
    try {
      const habit = habits.find(h => h.id === habitId)
      if (habit) {
        await updateHabit(habitId, { isActive: !habit.isActive })
      }
    } catch (error) {
      console.error('Error archiving habit:', error)
      throw error
    }
  }

  const value = {
    habits,
    habitCompletions,
    isLoading,
    error,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit, // Add this
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
