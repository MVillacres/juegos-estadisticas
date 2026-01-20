import { useMemo, useState } from 'react'
import GameCard from './GameCard'
import WishlistSearchBar from './WishlistSearchBar'
import '../styles/GameWishlist.css'

export default function GameWishlist({ games, onRemoveFromWishlist, onEditGame, onAddToLibrary, onAddToWishlist, setToast, currentSection = 'games' }) {
  const [selectedWishlistGame, setSelectedWishlistGame] = useState(null)

  // Filtrar solo juegos en la wishlist
  const wishlistGames = useMemo(() => {
    return games.filter(game => game.inWishlist === true)
  }, [games])

  // Agrupar por plataforma/genre si quieres, pero por ahora simple
  const handleRemoveFromWishlist = (gameId, gameName) => {
    if (onRemoveFromWishlist) {
      onRemoveFromWishlist(gameId)
      if (setToast) {
        setToast({ message: `${gameName} eliminado de tu ${currentSection === 'games' ? 'lista de deseos' : 'lista de animes por ver'}`, type: 'info' })
      }
    }
  }

  const handleAddToLibrary = (game) => {
    if (onAddToLibrary) {
      onAddToLibrary(game)
      if (setToast) {
        setToast({ message: `✨ ${game.name} agregado a tu colección`, type: 'success' })
      }
    }
  }

  const handleAddNewGameToWishlist = (gameData) => {
    if (onAddToWishlist) {
      onAddToWishlist(gameData)
      if (setToast) {
        setToast({ message: `${gameData.name} agregado a tu ${currentSection === 'games' ? 'lista de deseos' : 'lista de animes por ver'}`, type: 'success' })
      }
    }
  }

  return (
    <div className="game-wishlist">
      <div className="wishlist-header">
        <h2 className="wishlist-title">{currentSection === 'games' ? 'Lista de Deseos' : 'Animes por Ver'} ({wishlistGames.length})</h2>
        <p className="wishlist-subtitle">{currentSection === 'games' ? 'Juegos que quieres jugar pronto' : 'Animes que quieres ver pronto'}</p>
      </div>

      <WishlistSearchBar 
        onAddToWishlist={handleAddNewGameToWishlist}
        setToast={setToast}
        currentSection={currentSection}
      />

      <div className="wishlist-divider"></div>

      {wishlistGames.length === 0 ? (
        <div className="empty-wishlist">
          <div className="empty-content">
            <p className="empty-icon">♡</p>
            <p className="empty-title">Tu {currentSection === 'games' ? 'lista de deseos' : 'lista de animes por ver'} está vacía</p>
            <p className="empty-subtitle">Usa la barra de arriba para agregar elementos</p>
          </div>
        </div>
      ) : (
        <>
          <div className="wishlist-grid">
            {wishlistGames.map((game) => (
              <div 
                key={game.id} 
                className="wishlist-item"
                onClick={() => setSelectedWishlistGame(game)}
              >
                <GameCard 
                  game={game}
                  draggable={false}
                  isWishlist={true}
                  currentSection={currentSection}
                />
              </div>
            ))}
          </div>

          {wishlistGames.length === 0 && (
            <div className="empty-search">
              <p>No hay juegos en tu lista de deseos</p>
            </div>
          )}
        </>
      )}

      {selectedWishlistGame && (
        <div className="modal-overlay" onClick={() => setSelectedWishlistGame(null)}>
          <div className="wishlist-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedWishlistGame.name}</h3>
            <div className="wishlist-modal-actions">
              <button
                className="action-btn primary"
                onClick={() => {
                  handleAddToLibrary(selectedWishlistGame)
                  setSelectedWishlistGame(null)
                }}
                title="Agregar a colección"
              >
                + Agregar a colección
              </button>
              <button
                className="action-btn secondary"
                onClick={() => {
                  handleRemoveFromWishlist(selectedWishlistGame.id, selectedWishlistGame.name)
                  setSelectedWishlistGame(null)
                }}
                title="Quitar de wishlist"
              >
                Quitar de deseos
              </button>
              <button
                className="action-btn cancel"
                onClick={() => setSelectedWishlistGame(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
