import { useState, useEffect, useMemo } from 'react'
import '../styles/GameTimeline.css'

export default function GameTimeline({ games = [], onEditGame, onRemoveGame, setToast, filters = {}, sortBy = 'year-desc', currentSection = 'games' }) {
  const [orderedGames, setOrderedGames] = useState([])
  const [draggedGame, setDraggedGame] = useState(null)

  // Filtrar y ordenar juegos
  const filteredAndSortedGames = useMemo(() => {
    let filtered = [...games]

    // Excluir juegos en wishlist
    filtered = filtered.filter(game => game.inWishlist !== true)

    // Aplicar filtros
    if (filters.minYear) {
      filtered = filtered.filter(g => (g.yearPlayed || 0) >= parseInt(filters.minYear))
    }
    if (filters.maxYear) {
      filtered = filtered.filter(g => (g.yearPlayed || 0) <= parseInt(filters.maxYear))
    }
    if (filters.minCompletion) {
      filtered = filtered.filter(g => (g.completion || 0) >= parseInt(filters.minCompletion))
    }
    if (filters.difficulty) {
      filtered = filtered.filter(g => g.difficulty === filters.difficulty)
    }

    // Aplicar ordenamiento
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'year-asc':
          return (a.yearPlayed || 0) - (b.yearPlayed || 0)
        case 'year-desc':
          return (b.yearPlayed || 0) - (a.yearPlayed || 0)
        case 'completion-desc':
          return (b.completion || 0) - (a.completion || 0)
        case 'completion-asc':
          return (a.completion || 0) - (b.completion || 0)
        case 'rating-desc':
          return (b.rating || 0) - (a.rating || 0)
        case 'difficulty':
          return (a.difficulty || '').localeCompare(b.difficulty || '')
        case 'date-added':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        default:
          return (b.yearPlayed || 0) - (a.yearPlayed || 0)
      }
    })

    return sorted
  }, [games, filters, sortBy])

  useEffect(() => {
    setOrderedGames(filteredAndSortedGames)
  }, [filteredAndSortedGames])

  const handleDragStart = (e, game) => {
    setDraggedGame(game)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetGame) => {
    e.preventDefault()
    if (!draggedGame || draggedGame.id === targetGame.id) return

    // Reordenar localmente
    const sourceIndex = orderedGames.findIndex(g => g.id === draggedGame.id)
    const targetIndex = orderedGames.findIndex(g => g.id === targetGame.id)

    const newOrder = [...orderedGames]
    newOrder.splice(sourceIndex, 1)
    newOrder.splice(targetIndex, 0, draggedGame)

    setOrderedGames(newOrder)
    setDraggedGame(null)

    if (setToast) {
      setToast({ message: 'Orden actualizado', type: 'info' })
    }
  }

  const handleDragEnd = () => {
    setDraggedGame(null)
  }

  const groupByYear = () => {
    const grouped = {}
    orderedGames.forEach(game => {
      const year = game.yearPlayed || 'Sin año'
      if (!grouped[year]) {
        grouped[year] = []
      }
      grouped[year].push(game)
    })
    return Object.entries(grouped).sort((a, b) => {
      const yearA = isNaN(a[0]) ? 0 : parseInt(a[0])
      const yearB = isNaN(b[0]) ? 0 : parseInt(b[0])
      return yearB - yearA
    })
  }

  if (orderedGames.length === 0) {
    const hasFilters = Object.values(filters).some(v => v !== '')
    const message = hasFilters 
      ? 'No hay juegos que coincidan con los filtros seleccionados' 
      : 'No hay juegos para mostrar en la línea de tiempo'
    
    return (
      <div className="empty-timeline">
        <p>📭 {message}</p>
      </div>
    )
  }

  const groupedByYear = groupByYear()

  const getSortLabel = () => {
    const labels = {
      'year-desc': 'Año (Mayor → Menor)',
      'year-asc': 'Año (Menor → Mayor)',
      'completion-desc': 'Progreso (Mayor → Menor)',
      'completion-asc': 'Progreso (Menor → Mayor)',
      'rating-desc': 'Rating (Mayor → Menor)',
      'difficulty': 'Dificultad (A-Z)',
      'date-added': 'Fecha agregado'
    }
    return labels[sortBy] || 'Fecha agregado'
  }

  return (
    <div className="game-timeline">
      <div className="timeline-header">
        <h2 className="timeline-title">Línea de Tiempo ({orderedGames.length})</h2>
        <p className="timeline-subtitle">
          Ordenado por: <strong>{getSortLabel()}</strong> • Arrastra los elementos para reordenarlos
        </p>
      </div>

      <div className="timeline-container">
        {groupedByYear.map(([year, yearGames], yearIndex) => (
          <div key={year} className="timeline-year-section">
            <div className="timeline-year-marker">
              <span className="year-badge">{year}</span>
              <span className="year-count">{yearGames.length}</span>
            </div>

            <div className="timeline-year-games">
              {yearGames.map((game, gameIndex) => (
                <div
                  key={game.id}
                  className={`timeline-game-item ${draggedGame?.id === game.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, game)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, game)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="timeline-game-content">
                    <div className="timeline-game-image">
                      <img
                        src={game.image || 'https://via.placeholder.com/120x80'}
                        alt={game.name}
                      />
                    </div>

                    <div className="timeline-game-info">
                      <h4 className="timeline-game-name">{game.name}</h4>

                      <div className="timeline-game-meta">
                        {game.startDate && (
                          <span className="meta-item">
                            {new Date(game.startDate).toLocaleDateString('es-ES', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                        {game.difficulty && (
                          <span className="meta-item">{game.difficulty}</span>
                        )}
                        {game.completion !== undefined && (
                          <span className="meta-item">
                            {game.completion}% <span className="completion-bar" style={{ width: `${game.completion}%` }}></span>
                          </span>
                        )}
                      </div>

                      {game.playerNotes && (
                        <p className="timeline-game-notes">{game.playerNotes.substring(0, 80)}...</p>
                      )}
                    </div>

                    <div className="timeline-game-actions">
                      <button
                        className="timeline-action-btn edit"
                        title="Editar"
                        onClick={() => onEditGame?.(game)}
                      >
                        ✏️
                      </button>
                      <button
                        className="timeline-action-btn delete"
                        title="Eliminar"
                        onClick={() => onRemoveGame?.(game.id, game.name)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="timeline-connector"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
