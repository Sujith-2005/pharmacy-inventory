import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Forecasting from './pages/Forecasting'
import Alerts from './pages/Alerts'
import WasteAnalytics from './pages/WasteAnalytics'
import Layout from './components/Layout'
import Chatbot from './components/Chatbot'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route
          path="/"
          element={user ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="forecasting" element={<Forecasting />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="waste" element={<WasteAnalytics />} />
        </Route>
      </Routes>
      {user && <Chatbot />}
    </>
  )
}

export default App
