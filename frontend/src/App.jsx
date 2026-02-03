import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Forecasting from './pages/Forecasting'
import Alerts from './pages/Alerts'
import Suppliers from './pages/Suppliers'
import WasteAnalytics from './pages/WasteAnalytics'
import Analysis from './pages/Analysis'
import PriceComparison from './pages/PriceComparison'
import Layout from './components/Layout'
import Chatbot from './components/Chatbot'
import Orders from './pages/Orders'

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
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route
          path="/"
          element={user ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="forecasting" element={<Forecasting />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="waste" element={<WasteAnalytics />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="price-comparison" element={<PriceComparison />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Routes>
      {user && <Chatbot />}
    </>
  )
}

export default App
