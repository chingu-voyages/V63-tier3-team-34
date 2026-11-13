import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import type { EventData } from './components/dashboard/CreateEvent'
import EventDashboard from './components/dashboard/EventDashboard'

function App() {
  // const handleSave = (event: EventData) => {
  //   console.log('Event saved:', event)
  // }

  // const handleCancel = () => {
  //   console.log('Event creation cancelled')
  // }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/eventdashboard" element={<EventDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
