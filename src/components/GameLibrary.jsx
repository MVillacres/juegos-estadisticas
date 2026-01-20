import { useCallback, useMemo, useState } from 'react'
import GameCard from './GameCard'
import SearchBar from './SearchBar'
import '../styles/GameLibrary.css'

export default function GameLibrary({ library = [], onRemoveGame, onEditGame, onUpdateGame, onAddToWishlist, onRemoveFromWishlist, setToast, currentSection = 'games', onSearch, isLoading, searchResults, onSelectGame }) {
  const [draggedGame, setDraggedGame] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  const handleRemoveGame = useCallback(async (gameId, gameName) => {
    try {
      await onRemoveGame(gameId)
      if (setToast) {
        setToast({ message: `${gameName} eliminado de tu colección`, type: 'info' })
      }
    } catch (error) {
      if (setToast) {
        setToast({ message: `❌ Error al eliminar: ${error.message}`, type: 'error' })
      }
    }
  }, [onRemoveGame, setToast])

  const handleDragStart = (game) => {
    setDraggedGame(game)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropOnCard = async (e, targetGame) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('Drop event:', { draggedGame: draggedGame?.name, targetGame: targetGame?.name })
    
    if (!draggedGame || !onUpdateGame || draggedGame.id === targetGame.id) {
      console.log('Drop cancelled: missing data or same game')
      return
    }

    // Solo reordenar si están en el mismo año
    if (draggedGame.yearPlayed !== targetGame.yearPlayed) {
      console.log('Drop cancelled: different years')
      return
    }

    try {
      console.log('Updating order...', {
        draggedId: draggedGame.id,
        draggedOldOrder: draggedGame.order,
        targetId: targetGame.id,
        targetOldOrder: targetGame.order
      })
      
      // Intercambiar órdenes
      const draggedOrder = draggedGame.order || Date.now()
      const targetOrder = targetGame.order || Date.now() + 1000
      
      await onUpdateGame(draggedGame.id, { order: targetOrder })
      await onUpdateGame(targetGame.id, { order: draggedOrder })
      
      console.log('Update successful')
      
      if (setToast) {
        setToast({ message: '✨ Orden actualizado', type: 'success' })
      }
    } catch (error) {
      console.error('Drop error:', error)
      if (setToast) {
        setToast({ message: `❌ Error: ${error.message}`, type: 'error' })
      }
    } finally {
      setDraggedGame(null)
      setDragOverId(null)
    }
  }

  // Agrupar juegos por año y ordenar dentro del año
  const gamesByYear = useMemo(() => {
    const grouped = {}
    
    // Filtrar juegos: excluir los que están en wishlist
    const libraryGames = library.filter(game => game.inWishlist !== true)
    
    // Primero, agrupar juegos por año
    libraryGames.forEach(game => {
      const year = game.yearPlayed || 'Sin año'
      if (!grouped[year]) {
        grouped[year] = []
      }
      grouped[year].push(game)
    })

    // Luego ordenar cada año: primero por order (si existe), luego por fecha de creación
    Object.keys(grouped).forEach(year => {
      grouped[year].sort((a, b) => {
        // Si ambos tienen order, usar eso
        if (a.order && b.order) {
          return a.order - b.order
        }
        // Si uno tiene order y otro no, el que tiene order va primero
        if (a.order && !b.order) return -1
        if (!a.order && b.order) return 1
        // Si ninguno tiene order, mantener el orden original (por id o createdAt)
        return 0
      })
    })

    // Finalmente, ordenar años de mayor a menor
    const sortedYears = Object.entries(grouped).sort((a, b) => {
      const yearA = isNaN(a[0]) ? 0 : parseInt(a[0])
      const yearB = isNaN(b[0]) ? 0 : parseInt(b[0])
      return yearB - yearA
    })

    return sortedYears
  }, [library])

  return (
    <section className="game-library">
      <div className="library-header">
        <h2 className="section-title">📚 Mi Colección</h2>
        {library.length > 0 && (
          <span className="library-count">{library.length} juego{library.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      <SearchBar
        onSearch={onSearch}
        isLoading={isLoading}
        searchResults={searchResults}
        onSelectGame={onSelectGame}
        currentSection={currentSection}
      />

      {library.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No hay elementos en tu colección</h3>
          <p>Busca y agrega tus juegos favoritos para comenzar</p>
        </div>
      ) : (
        <div className="timeline-library">
          {gamesByYear.map(([year, yearGames]) => (
            <div 
              key={year} 
              className="year-section"
            >
              <div className="year-header">
                <h3 className="year-title">{year}</h3>
                <span className="year-badge">{yearGames.length}</span>
              </div>
              <div className="library-grid">
                {yearGames.map((game) => (
                  <div
                    key={game.id}
                    onDragOver={handleDragOver}
                    onDragLeave={() => setDragOverId(null)}
                    onDrop={(e) => handleDropOnCard(e, game)}
                    className={dragOverId === game.id ? 'drag-over-card' : ''}
                  >
                    <GameCard 
                      game={game} 
                      isSearchResult={false}
                      draggable={true}
                      onRemove={handleRemoveGame}
                      onEdit={onEditGame}
                      onAddToWishlist={onAddToWishlist}
                      onRemoveFromWishlist={onRemoveFromWishlist}
                      onDragStart={() => handleDragStart(game)}
                      onDragEnd={() => setDraggedGame(null)}
                      onDragEnter={() => setDragOverId(game.id)}
                      currentSection={currentSection}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
