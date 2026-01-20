import { useState } from 'react'
import '../styles/GameCard.css'
import '../styles/GameCardMenu.css'

export default function GameCard({ game, isSearchResult = false, onRemove, onSelect, onEdit, onAddToWishlist, onRemoveFromWishlist, draggable = false, onDragStart, onDragEnd, onDragEnter, currentSection = 'games', isWishlist = false }) {
  const [imageError, setImageError] = useState(false)

  const handleSelect = () => {
    if (onSelect) {
      onSelect(game)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(game)
    }
  }

  const handleCardClick = () => {
    if (!isSearchResult && onEdit) {
      onEdit(game)
    }
  }

  // Función para formatear fechas
  const formatDate = (dateStr) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div 
      className="game-card"
      onClick={handleCardClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragEnter={onDragEnter}
      style={{ cursor: draggable ? 'grab' : (!isSearchResult ? 'pointer' : 'auto') }}
    >
      <div className="card-image-wrapper">
        <img 
          src={imageError ? 'https://via.placeholder.com/300x200?text=No+Image' : (game.background_image || game.image || 'https://via.placeholder.com/300x200')}
          alt={game.name}
          className="card-image"
          loading="lazy"
          onError={() => setImageError(true)}
        />
        <div className="card-overlay">
          {game.hoursPlayed && (
            <span className="hours-badge">{game.hoursPlayed}h</span>
          )}
        </div>
      </div>

      <div className="card-content">
        <h3 className="card-title">{game.name}</h3>
        
        <div className="card-info">
          {!isWishlist && currentSection === 'games' && game.released && (
            <p className="info-item">{new Date(game.released).getFullYear()}</p>
          )}
          {!isWishlist && game.yearPlayed && (
            <p className="info-item">{currentSection === 'games' ? 'Jugado' : 'Visto'}: {game.yearPlayed}</p>
          )}
          {currentSection === 'games' && game.hoursPlayed && (
            <p className="info-item">{game.hoursPlayed} horas</p>
          )}
          {currentSection === 'animes' && game.chaptersWatched && (
            <p className="info-item">{game.chaptersWatched} capítulos</p>
          )}
        </div>

        {(game.startDate || game.endDate) && (
          <div className="dates-info">
            {game.startDate && <span>Desde: {formatDate(game.startDate)}</span>}
            {game.endDate && <span>Hasta: {formatDate(game.endDate)}</span>}
          </div>
        )}

        {game.playerNotes && (
          <p className="player-notes" title={game.playerNotes}>
            {game.playerNotes.substring(0, 60)}...
          </p>
        )}

        <div className="card-actions">
          {isSearchResult ? (
            <button
              className="action-button add"
              onClick={handleSelect}
            >
              + Agregar
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
