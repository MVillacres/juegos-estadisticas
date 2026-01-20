import { useState } from 'react'
import '../styles/ViewToggle.css'

export default function ViewToggle({ currentView, onViewChange, onFilterChange, onSortChange, games = [] }) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    minYear: '',
    maxYear: '',
    minCompletion: '',
    difficulty: ''
  })
  const [sortBy, setSortBy] = useState('date-added')

  // Extraer años únicos disponibles
  const availableYears = [...new Set(games
    .map(g => g.yearPlayed)
    .filter(y => y)
    .sort((a, b) => b - a)
  )]

  const availableDifficulties = [...new Set(games
    .map(g => g.difficulty)
    .filter(d => d)
  )].sort()

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    onSortChange(newSort)
  }

  const handleClearFilters = () => {
    const emptyFilters = {
      minYear: '',
      maxYear: '',
      minCompletion: '',
      difficulty: ''
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
    setSortBy('year-desc')
    onSortChange('year-desc')
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '') || sortBy !== 'year-desc'

  return (
    <div className="view-toggle-container">
      <div className="view-buttons">
        <button
          className={`view-btn ${currentView === 'grid' ? 'active' : ''}`}
          onClick={() => onViewChange('grid')}
          title="Vista Galería"
        >
          <span className="view-icon">▢</span> Galería
        </button>
        <button
          className={`view-btn ${currentView === 'timeline' ? 'active' : ''}`}
          onClick={() => onViewChange('timeline')}
          title="Vista Línea de Tiempo"
        >
          <span className="view-icon">≡</span> Línea de Tiempo
        </button>
        <button
          className={`view-btn ${currentView === 'wishlist' ? 'active' : ''}`}
          onClick={() => onViewChange('wishlist')}
          title="Lista de Deseos"
        >
          <span className="view-icon">♡</span> Lista de Deseos
        </button>
      </div>

      <div className="filter-controls">
        {(currentView === 'grid' || currentView === 'timeline') && (
          <>
            <button
              className={`filter-btn ${showFilters ? 'active' : ''} ${hasActiveFilters ? 'has-filters' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              title="Mostrar filtros"
            >
              <span className="filter-icon">⚙</span> Filtros {hasActiveFilters && <span className="filter-indicator">●</span>}
            </button>

            {currentView === 'timeline' && (
          <div className="sort-select">
            <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
              <option value="year-desc">Año (Mayor → Menor)</option>
              <option value="year-asc">Año (Menor → Mayor)</option>
              <option value="completion-desc">Progreso (Mayor → Menor)</option>
              <option value="completion-asc">Progreso (Menor → Mayor)</option>
              <option value="rating-desc">Rating (Mayor → Menor)</option>
              <option value="difficulty">Dificultad (A-Z)</option>
              <option value="date-added">Fecha agregado</option>
            </select>
          </div>
            )}
          </>
        )}
      </div>

      {showFilters && (currentView === 'grid' || currentView === 'timeline') && (
        <div className="filters-panel">
          <div className="filters-content">
            <div className="filter-group">
              <label htmlFor="minYear">Año Mínimo</label>
              <select
                id="minYear"
                value={filters.minYear}
                onChange={(e) => handleFilterChange('minYear', e.target.value)}
              >
                <option value="">Todos</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="maxYear">Año Máximo</label>
              <select
                id="maxYear"
                value={filters.maxYear}
                onChange={(e) => handleFilterChange('maxYear', e.target.value)}
              >
                <option value="">Todos</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="minCompletion">Progreso Mínimo</label>
              <select
                id="minCompletion"
                value={filters.minCompletion}
                onChange={(e) => handleFilterChange('minCompletion', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="0">0%+</option>
                <option value="25">25%+</option>
                <option value="50">50%+</option>
                <option value="75">75%+</option>
                <option value="100">100%</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="difficulty">Dificultad</label>
              <select
                id="difficulty"
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <option value="">Todas</option>
                {availableDifficulties.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                className="clear-filters-btn"
                onClick={handleClearFilters}
              >
                ✕ Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
