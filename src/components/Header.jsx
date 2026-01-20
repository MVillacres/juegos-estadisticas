import { useState, useRef, useEffect } from 'react'
import { auth } from '../config/firebase'
import '../styles/Header.css'

export default function Header({ user, onLogout, currentSection = 'games', onSectionChange, onProfilePhotoUpdate }) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [currentUser, setCurrentUser] = useState(user)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Actualizar currentUser cuando user cambia o cuando auth.currentUser cambia
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setCurrentUser({
          uid: authUser.uid,
          displayName: authUser.displayName,
          email: authUser.email,
          photoURL: authUser.photoURL
        })
      }
    })
    return () => unsubscribe()
  }, [])

  const handleLogoutClick = async () => {
    if (window.confirm('¿Deseas cerrar sesión?')) {
      await onLogout()
    }
  }

  const toggleSection = (section) => {
    if (onSectionChange) {
      onSectionChange(section)
    }
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file && onProfilePhotoUpdate) {
      onProfilePhotoUpdate(file)
      // Resetear el input para poder seleccionar el mismo archivo otra vez
      e.target.value = ''
    }
  }

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <h1 className="title-main">Mi Colección de {currentSection === 'games' ? 'Juegos' : 'Animes'}</h1>
          <p className="title-subtitle">{currentSection === 'games' ? 'Descubre y guarda tus juegos favoritos' : 'Descubre y guarda tus animes favoritos'}</p>
        </div>

        <div className="section-toggle">
          <button
            className={`toggle-btn ${currentSection === 'games' ? 'active' : ''}`}
            onClick={() => toggleSection('games')}
            title="Ver colección de juegos"
          >
            Juegos
          </button>
          <button
            className={`toggle-btn ${currentSection === 'animes' ? 'active' : ''}`}
            onClick={() => toggleSection('animes')}
            title="Ver colección de animes"
          >
            Animes
          </button>
        </div>

        {currentUser && (
          <div className="header-user-right">
            <div className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.displayName}
                className="user-avatar"
                title={currentUser.displayName}
              />
              {showUserMenu && (
                <div className="user-menu">
                  <div className="user-info">
                    <p className="user-name">{currentUser.displayName}</p>
                    <p className="user-email">{currentUser.email}</p>
                  </div>
                  <button className="btn-profile-photo" onClick={triggerPhotoUpload} title="Cambiar foto de perfil">
                    📷 Cambiar foto
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                  <button className="btn-logout" onClick={handleLogoutClick}>
                    Salir
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
