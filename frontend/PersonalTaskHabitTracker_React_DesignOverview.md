
# Personal Task & Habit Tracker

## Overview
This is a full-stack web application that allows users to manage their personal tasks and track habits. It supports full CRUD operations and includes a clean, modern interface inspired by UI concepts from platforms like Figma. The application is built with **ReactJS** (frontend) and **Spring Boot** (backend), supporting essential productivity features and a beautiful user experience.

---

## 🌟 Features

### ✅ Task Management
- Add, edit, delete personal tasks
- Set due dates, priorities, categories, and statuses (To Do, In Progress, Done)
- Filter, search, and sort tasks by status, date, or tag
- Task status indicators and completion bars
- Optional sub-tasks and collaboration notes (UI scaffolding only)

### ✅ Habit Tracker
- Add habits with defined frequency: daily, weekly, or custom
- Calendar integration with visual habit progress (e.g. streaks)
- Mark habits as completed per day and view logs
- Habit reminders and inspirational prompts

### ✅ Dashboard (Home)
- Personalized dashboard with current date and user profile
- Progress tracker (e.g. "2 of 5 completed today")
- Featured tasks/habits (priority or time-sensitive)
- Weekly overview cards or summary visuals

### ✅ Calendar View
- Horizontal/vertical calendar displaying tasks and habits by time
- Daily and weekly view modes
- Visual indicators for time blocks, task types, and locations

### ✅ Pomodoro Timer / Focus Mode (Optional)
- Select a task/habit and start a focus timer (e.g. 25-minute sessions)
- Optional short/long breaks between sessions
- Visual countdown with auto-logging

### ✅ Reminders
- Scheduled alerts for tasks and habits
- Friendly messages for habit consistency ("Don't forget your walk!")

---

## 🛠 Tech Stack

### Frontend (ReactJS)
- **Framework**: ReactJS with Hooks and functional components
- **Styling**: CSS Modules / SCSS or styled-components
- **Routing**: React Router DOM
- **State Management**: Context API or Redux (for complex state)
- **UI Inspiration**: Figma-style cards, vertical tabs, soft color palette, minimal icons

### Backend (Spring Boot)
- **Framework**: Spring Boot with RESTful services
- **Security**: Spring Security (optional for user auth)
- **Database**: H2 for dev / PostgreSQL or MySQL in production
- **Entities**:
  - `User`: id, name, email, password (if auth)
  - `Task`: id, title, description, status, dueDate, category, priority
  - `Habit`: id, title, frequency, createdDate
  - `HabitCompletion`: id, habitId, completionDate

### Dev Environment
- **IDE**: Visual Studio Code
- **Version Control**: Git + GitHub
- **Build Tools**: Create React App or Vite (frontend), Maven/Gradle (backend)

---

## 🎨 UI/UX Design Direction

### General UI Goals
- Clean, minimal, soft color palette
- Rounded cards and component containers
- Sidebar navigation with icons and section labels
- Calendar view with color-coded events
- Responsive design for desktop-first layout

### Referenced UI Inspirations (from Figma)
- **Sidebar Navigation** with user avatar, icons for Home, Tasks, Calendar
- **Weekly Tasks Card View** with quick actions (archive, new, edit)
- **Timeline Calendar UI** with time slots and visual indicators
- **Focus Timer** module styled with buttons and time indicator
- **Habit Reminder Section** with friendly notes and icons

---

## 🔁 User Journeys

### 1. First-Time User
- Opens app → Dashboard shows empty state and prompts to add a task/habit
- Creates first task with due date and description
- Task appears under “Today” or “Weekly Tasks” section

### 2. Regular Task Workflow
- Adds a task with category, priority, and status
- Updates task status as it progresses (To Do → In Progress → Done)
- Completes the task and sees dashboard progress update

### 3. Habit Management Flow
- Adds a daily habit (e.g., “Morning run”)
- Views habit on dashboard calendar
- Marks it done for the day → habit streak count increases

### 4. Calendar Interaction
- Switches to calendar tab → sees tasks and habits by time
- Clicks on an event to edit or mark complete

### 5. Focus Mode Journey
- User selects a task from dashboard
- Starts a 25-minute timer (Pomodoro)
- Completes session → marks task/habit as completed

---

## 🚀 Future Improvements
- Integration with Google Calendar or device reminders
- Advanced productivity analytics (weekly reports)
- Voice input for adding tasks/habits
- Mobile responsive layout
