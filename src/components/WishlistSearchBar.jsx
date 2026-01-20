import { useState, useEffect, useRef } from 'react'
import '../styles/WishlistSearchBar.css'

const API_KEY = '4f784c0deb6247d888199502464e094e'

export default function WishlistSearchBar({ onAddToWishlist, setToast, currentSection = 'games' }) {
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const debounceTimer = useRef(null)
  const abortControllerRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    // Limpiar timer anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (query.trim()) {
      // Crear nuevo timer con debounce
      debounceTimer.current = setTimeout(async () => {
        setIsLoading(true)
        
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

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
          setShowDropdown(true)
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error(`Error searching ${currentSection}:`, error)
            setToast?.({ message: `Error al buscar ${currentSection === 'games' ? 'juegos' : 'animes'}`, type: 'error' })
          }
          setSearchResults([])
        } finally {
          setIsLoading(false)
        }
      }, 800)
    } else {
      setShowDropdown(false)
      setSearchResults([])
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query, setToast, currentSection])

  const handleInputChange = (e) => {
    setQuery(e.target.value)
  }

  const handleClear = () => {
    setQuery('')
    setShowDropdown(false)
    setSearchResults([])
  }

  const handleSelectGame = (game) => {
    const idField = currentSection === 'games' ? 'rawgId' : 'anilistId'
    onAddToWishlist?.({
      [idField]: game.id,
      name: game.name,
      image: game.background_image,
      released: game.released || 'N/A',
      rating: game.rating || 0
    })
    setQuery('')
    setShowDropdown(false)
    setSearchResults([])
  }

  return (
    <div className="wishlist-search-container" ref={containerRef}>
      <div className="wishlist-search-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query && setShowDropdown(true)}
          placeholder="Busca un elemento para agregar a deseos..."
          className="wishlist-search-input-field"
          disabled={isLoading}
          autoComplete="off"
        />
        {query && (
          <button 
            type="button"
            className="wishlist-clear-button"
            onClick={handleClear}
            title="Limpiar búsqueda"
          >
            ×
          </button>
        )}
        {isLoading && <div className="wishlist-search-spinner"></div>}
      </div>
      
      {showDropdown && query.trim() && (
        <div className="wishlist-search-dropdown">
          {isLoading ? (
            <div className="wishlist-dropdown-loading">
              <div className="spinner"></div>
              <span>Buscando {currentSection === 'games' ? 'juegos' : 'animes'}...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="wishlist-dropdown-results">
              {searchResults.map((game) => (
                <div 
                  key={game.id} 
                  className="wishlist-dropdown-item"
                  onClick={() => handleSelectGame(game)}
                >
                  {game.background_image && (
                    <img src={game.background_image} alt={game.name} className="wishlist-dropdown-image" />
                  )}
                  <div className="wishlist-dropdown-info">
                    <div className="wishlist-dropdown-name">{game.name}</div>
                    <div className="wishlist-dropdown-meta">
                      {game.released && <span>{game.released}</span>}
                      {game.rating && <span>{game.rating}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="wishlist-dropdown-empty">
              <p>No se encontraron resultados para "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
