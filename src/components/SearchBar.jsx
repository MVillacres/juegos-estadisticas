import { useState, useEffect, useRef } from 'react'
import '../styles/SearchBar.css'

export default function SearchBar({ onSearch, isLoading, searchResults, onSelectGame, currentSection = 'games' }) {
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceTimer = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    // Limpiar timer anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (query.trim()) {
      // Crear nuevo timer con debounce de 800ms para evitar freezeos
      debounceTimer.current = setTimeout(() => {
        onSearch(query)
        setShowDropdown(true)
      }, 800)
    } else {
      setShowDropdown(false)
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query, onSearch])

  const handleInputChange = (e) => {
    setQuery(e.target.value)
  }

  const handleClear = () => {
    setQuery('')
    setShowDropdown(false)
  }

  const handleSelectGame = (game) => {
    onSelectGame?.(game)
    setQuery('')
    setShowDropdown(false)
  }

  return (
    <div className="search-container" ref={containerRef}>
      <h3 className="search-title">🔍 Buscar {currentSection === 'games' ? 'juego' : 'anime'}</h3>
      <div className="search-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query && setShowDropdown(true)}
          placeholder={currentSection === 'games' ? 'Buscar juego (ej: Elden Ring, God of War...)...' : 'Buscar anime (ej: Attack on Titan, Tokyo Ghoul...)...'}
          className="search-input"
          disabled={isLoading}
          autoComplete="off"
        />
        {query && (
          <button 
            type="button"
            className="clear-button"
            onClick={handleClear}
            title="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
        {isLoading && <div className="search-spinner"></div>}
      </div>
      
      {showDropdown && query.trim() && (
        <div className="search-dropdown">
          {isLoading ? (
            <div className="dropdown-loading">
              <div className="spinner"></div>
              <span>Buscando {currentSection === 'games' ? 'juegos' : 'animes'}...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="dropdown-results">
              {searchResults.map((game) => (
                <div 
                  key={game.id} 
                  className="dropdown-item"
                  onClick={() => handleSelectGame(game)}
                >
                  {game.background_image && (
                    <img src={game.background_image} alt={game.name} className="dropdown-image" />
                  )}
                  <div className="dropdown-info">
                    <div className="dropdown-name">{game.name}</div>
                    <div className="dropdown-meta">
                      {game.released && <span>{game.released}</span>}
                      {game.rating && <span>{game.rating}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dropdown-empty">
              <span>No se encontraron {currentSection === 'games' ? 'juegos' : 'animes'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
