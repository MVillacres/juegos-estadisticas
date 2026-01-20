import Login from './components/Login'
import AppContent from './components/AppContent'
import { useAuth } from './hooks/useAuth'
import './styles/App.css'

function App() {
  const { user, isAuthenticated, logout, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Inicializando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return <AppContent user={user} logout={logout} />
}

export default App
