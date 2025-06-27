import { useState } from 'react'
import { ChevronLeft, ChevronRight, Star, Circle } from 'lucide-react'
import DateModal from '../components/calendar/DateModal'
import './Calendar.css'

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1)) // May 2025
  const [selectedDate, setSelectedDate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ]
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  // Mock events data
  const events = {
    1: [
      { type: 'work', text: 'First Day of Asian America and Pacific Islander Heritage Month', time: '10a', color: 'teal' },
      { type: 'life', text: '1m', color: 'orange' }
    ],
    2: [
      { type: 'work', text: 'Orthodox Easter', color: 'orange' },
      { type: 'life', text: '1m', color: 'orange' }
    ],
    3: [
      { type: 'work', text: 'Write something here', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    4: [
      { type: 'work', text: 'Write something here', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    5: [
      { type: 'work', text: 'Cinco de Mayo', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    6: [
      { type: 'work', text: 'Write something here', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    7: [
      { type: 'work', text: 'Write something here', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    9: [
      { type: 'life', text: 'Mother\'s Day ❤️', color: 'orange' }
    ],
    10: [
      { type: 'work', text: 'Write something here', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    11: [
      { type: 'work', text: 'Write something here', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    12: [
      { type: 'work', text: 'Eid al-Fitr', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    13: [
      { type: 'work', text: 'Write something here', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    14: [
      { type: 'work', text: 'Write something here', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    16: [
      { type: 'work', text: 'Write something here', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    17: [
      { type: 'work', text: 'Tax day', time: '10a', color: 'pink' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    18: [
      { type: 'work', text: 'Write something here', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    19: [
      { type: 'work', text: 'Write something here', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    20: [
      { type: 'work', text: 'Write something here', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    21: [
      { type: 'work', text: 'Write something here', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    24: [
      { type: 'work', text: 'Write something here', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    25: [
      { type: 'work', text: 'Write something here', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    26: [
      { type: 'work', text: 'Write something here', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    27: [
      { type: 'special', text: 'Take day off to recharge', time: '4:3', color: 'blue' },
      { type: 'special', text: 'Going to the beach', color: 'blue' },
      { type: 'life', text: 'Start vacation', color: 'orange' }
    ],
    28: [
      { type: 'work', text: 'Beach day', time: '10a', color: 'orange' },
      { type: 'work', text: 'Write something here', time: '1m', color: 'orange' }
    ],
    29: [
      { type: 'work', text: 'Beach day', time: '10a', color: 'orange' }
    ]
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(clickedDate)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedDate(null)
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = events[day] || []
      const isToday = day === 15 // Highlight day 15 as "today" for demo
      
      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          <div className="day-header">
            <span className="day-number">{day}</span>
            {dayEvents.length > 0 && (
              <div className="day-indicators">
                <Star size={12} className="star-icon" />
              </div>
            )}
          </div>
          <div className="day-events">
            {dayEvents.map((event, index) => (
              <div key={index} className={`event event-${event.color}`}>
                {event.time && <span className="event-time">{event.time}</span>}
                <span className="event-text">{event.text}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return days
  }

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <div className="month-navigation">
          <button className="nav-btn" onClick={() => navigateMonth(-1)}>
            <ChevronLeft size={20} />
          </button>
          <h1 className="month-title">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h1>
          <button className="nav-btn" onClick={() => navigateMonth(1)}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="calendar-container">
        <div className="calendar-grid">
          {/* Day headers */}
          <div className="calendar-header-row">
            {dayNames.map(day => (
              <div key={day} className="day-header-cell">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="calendar-body">
            {renderCalendarDays()}
          </div>
        </div>
      </div>

      {/* Date Modal */}
      <DateModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedDate={selectedDate}
      />
    </div>
  )
}

export default Calendar
