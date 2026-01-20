import { useState, useCallback, useRef } from 'react'
import Header from './Header'
import SearchBar from './SearchBar'
import GameLibrary from './GameLibrary'
import GameTimeline from './GameTimeline'
import GameWishlist from './GameWishlist'
import ViewToggle from './ViewToggle'
import Toast from './Toast'
import AddGameModal from './AddGameModal'
import EditGameModal from './EditGameModal'
import DataManager from './DataManager'
import { useFirebaseGames } from '../hooks/useFirebaseGames'
import { useViewPreference } from '../hooks/useViewPreference'
import { auth, storage } from '../config/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'
import '../styles/App.css'

function AppContent({ user, logout }) {
  const { games: library, addGame, updateGame, deleteGame, exportGames, importGames, loading: gamesLoading } = useFirebaseGames(user?.uid, 'games')
  const { games: animes, addGame: addAnime, updateGame: updateAnime, deleteGame: deleteAnime, exportGames: exportAnimes, importGames: importAnimes, loading: animesLoading } = useFirebaseGames(user?.uid, 'animes')
  const { viewMode, updateViewMode } = useViewPreference()
  
  const [currentSection, setCurrentSection] = useState('games')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)
  const [editingGame, setEditingGame] = useState(null)
  const [filters, setFilters] = useState({
    minYear: '',
    maxYear: '',
    minCompletion: '',
    difficulty: ''
  })
  const [sortBy, setSortBy] = useState('date-added')
  const abortControllerRef = useRef(null)

  const API_KEY = '4f784c0deb6247d888199502464e094e'

  // Usar los datos apropiados según la sección
  const currentData = currentSection === 'games' ? library : animes
  const currentAddGame = currentSection === 'games' ? addGame : addAnime
  const currentUpdateGame = currentSection === 'games' ? updateGame : updateAnime
  const currentDeleteGame = currentSection === 'games' ? deleteGame : deleteAnime

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    try {
      let response
      
      if (currentSection === 'games') {
        // Búsqueda de juegos con RAWG API
        response = await fetch(
          `https://api.rawg.io/api/games?key=${API_KEY}&search=${query}`,
          { signal: abortControllerRef.current.signal }
        )
        const data = await response.json()
        setSearchResults(data.results?.slice(0, 8) || [])
      } else {
        // Búsqueda de animes con AniList API (GraphQL)
        const gqlQuery = `
          query {
            Page(page: 1, perPage: 8) {
              media(search: "${query.replace(/"/g, '\\"')}", type: ANIME) {
                id
                title {
                  userPreferred
                }
                coverImage {
                  large
                }
                startDate {
                  year
                }
                averageScore
              }
            }
          }
        `
        response = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: gqlQuery }),
          signal: abortControllerRef.current.signal
        })
        const data = await response.json()
        if (data.errors) {
          console.error('AniList GraphQL Error:', data.errors)
          setSearchResults([])
        } else {
          const animeResults = data.data?.Page?.media?.map(anime => ({
            id: anime.id,
            name: anime.title?.userPreferred || 'Sin título',
            background_image: anime.coverImage?.large,
            released: anime.startDate?.year,
            rating: anime.averageScore ? anime.averageScore / 10 : 0
          })) || []
          setSearchResults(animeResults)
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(`Error searching ${currentSection}:`, error)
      }
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [currentSection])

  const handleSelectGame = useCallback((game) => {
    const idField = currentSection === 'games' ? 'rawgId' : 'anilistId'
    if (currentData.some(g => g[idField] === game.id)) {
      setToast({ message: `${game.name} ya está en tu colección`, type: 'info' })
      return
    }
    setSelectedGame(game)
  }, [currentData, currentSection])

  const handleConfirmAddGame = useCallback(async (formData) => {
    try {
      const idField = currentSection === 'games' ? 'rawgId' : 'anilistId'
      const newGame = {
        [idField]: selectedGame.id,
        name: selectedGame.name,
        image: selectedGame.background_image,
        released: selectedGame.released || 'N/A',
        rating: selectedGame.rating || 0,
        ...formData
      }

      if (currentSection === 'games') {
        await addGame(newGame)
      } else {
        await addAnime(newGame)
      }
      setToast({ message: `✨ ${selectedGame.name} agregado a tu colección`, type: 'success' })
      setSearchResults([])
      setSelectedGame(null)
    } catch (error) {
      setToast({ message: `❌ Error: ${error.message}`, type: 'error' })
    }
  }, [selectedGame, currentSection, addGame, addAnime])

  const handleEditGame = useCallback((game) => {
    setEditingGame(game)
  }, [])

  const handleConfirmEditGame = useCallback(async (formData) => {
    try {
      await currentUpdateGame(editingGame.id, formData)
      setToast({ message: `✨ ${editingGame.name} actualizado`, type: 'success' })
      setEditingGame(null)
    } catch (error) {
      setToast({ message: `❌ Error: ${error.message}`, type: 'error' })
    }
  }, [editingGame, currentUpdateGame])

  const handleExport = useCallback(() => {
    const success = exportGames()
    if (success) {
      setToast({ message: '💾 Colección exportada correctamente', type: 'success' })
    } else {
      setToast({ message: '❌ Error al exportar', type: 'error' })
    }
  }, [exportGames])

  const handleImport = useCallback(async (file) => {
    try {
      await importGames(file)
      setToast({ message: '📂 Colección importada correctamente', type: 'success' })
    } catch (error) {
      setToast({ message: `❌ Error: ${error.message}`, type: 'error' })
    }
  }, [importGames])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
    } catch (error) {
      setToast({ message: `❌ Error al cerrar sesión: ${error.message}`, type: 'error' })
    }
  }, [logout])

  const handleProfilePhotoUpdate = useCallback(async (file) => {
    try {
      if (!user?.uid || !file) return
      
      // Crear referencia al archivo en Storage
      const fileName = `profile-photos/${user.uid}-${Date.now()}`
      const storageRef = ref(storage, fileName)
      
      // Subir archivo
      await uploadBytes(storageRef, file)
      
      // Obtener URL descargable
      const photoURL = await getDownloadURL(storageRef)
      
      // Actualizar el perfil del usuario autenticado
      const currentUser = auth.currentUser
      if (currentUser) {
        await updateProfile(currentUser, { photoURL })
        setToast({ message: '✨ Foto de perfil actualizada', type: 'success' })
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      setToast({ message: `❌ Error al actualizar foto: ${error.message}`, type: 'error' })
    }
  }, [user?.uid, setToast])

  const handleAddToWishlist = useCallback(async (gameId) => {
    try {
      await currentUpdateGame(gameId, { inWishlist: true })
      setToast({ message: '💝 Agregado a tu lista de deseos', type: 'success' })
    } catch (error) {
      setToast({ message: `❌ Error: ${error.message}`, type: 'error' })
    }
  }, [currentUpdateGame])

  const handleRemoveFromWishlist = useCallback(async (gameId) => {
    try {
      await currentUpdateGame(gameId, { inWishlist: false })
      setToast({ message: '💔 Removido de tu lista de deseos', type: 'info' })
    } catch (error) {
      setToast({ message: `❌ Error: ${error.message}`, type: 'error' })
    }
  }, [currentUpdateGame])

  const handleAddFromWishlistToLibrary = useCallback(async (game) => {
    try {
      // Actualizar el juego para quitarlo de wishlist y marcarlo como agregado
      await currentUpdateGame(game.id, { 
        inWishlist: false,
        // Mantener los datos existentes pero marcar como en biblioteca
      })
      if (setToast) {
        setToast({ message: `✨ ${game.name} movido a tu colección`, type: 'success' })
      }
    } catch (error) {
      setToast({ message: `❌ Error: ${error.message}`, type: 'error' })
    }
  }, [currentUpdateGame])

  const handleAddNewGameToWishlist = useCallback(async (gameData) => {
    try {
      const newGame = {
        ...gameData,
        inWishlist: true,
        yearPlayed: new Date().getFullYear(),
        completion: 0,
        difficulty: 'Normal',
        rating: 0,
        playerNotes: 'Agregado desde lista de deseos'
      }
      
      await addGame(newGame)
      setToast({ message: `${gameData.name} agregado a tu lista de deseos`, type: 'success' })
    } catch (error) {
      setToast({ message: `Error: ${error.message}`, type: 'error' })
    }
  }, [addGame, setToast])

  if (gamesLoading || animesLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando tu colección...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <Header 
        user={user}
        onLogout={handleLogout}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        onProfilePhotoUpdate={handleProfilePhotoUpdate}
        dataManager={<DataManager onExport={handleExport} onImport={handleImport} />} 
      />
      <main className="main-content">
        <ViewToggle 
          currentView={viewMode}
          onViewChange={updateViewMode}
          onFilterChange={setFilters}
          onSortChange={setSortBy}
          games={library}
        />

        {viewMode === 'grid' && (
          <GameLibrary 
            library={currentData}
            onRemoveGame={currentDeleteGame}
            onEditGame={handleEditGame}
            onUpdateGame={currentUpdateGame}
            onAddToWishlist={handleAddToWishlist}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            setToast={setToast}
            currentSection={currentSection}
            onSearch={handleSearch}
            isLoading={isLoading}
            searchResults={searchResults}
            onSelectGame={handleSelectGame}
          />
        )}

        {viewMode === 'timeline' && (
          <GameTimeline
            games={currentData}
            onEditGame={handleEditGame}
            onRemoveGame={currentDeleteGame}
            setToast={setToast}
            filters={filters}
            sortBy={sortBy}
            currentSection={currentSection}
          />
        )}

        {viewMode === 'wishlist' && (
          <GameWishlist
            games={currentData}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            onEditGame={handleEditGame}
            onAddToLibrary={handleAddFromWishlistToLibrary}
            onAddToWishlist={handleAddNewGameToWishlist}
            setToast={setToast}
            currentSection={currentSection}
          />
        )}
      </main>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {selectedGame && (
        <AddGameModal 
          game={selectedGame}
          onConfirm={handleConfirmAddGame}
          onCancel={() => setSelectedGame(null)}
          currentSection={currentSection}
        />
      )}
      {editingGame && (
        <EditGameModal 
          game={editingGame}
          onConfirm={handleConfirmEditGame}
          onCancel={() => setEditingGame(null)}
          onDelete={currentDeleteGame}
          currentSection={currentSection}
        />
      )}
    </div>
  )
}

export default AppContent
