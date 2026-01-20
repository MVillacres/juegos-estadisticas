import { useState, useEffect } from 'react'
import '../styles/EditGameModal.css'

export default function EditGameModal({ game, onConfirm, onCancel, onDelete, currentSection = 'games' }) {
  const [formData, setFormData] = useState({
    yearPlayed: '',
    startDate: '',
    endDate: '',
    hoursPlayed: '',
    chaptersWatched: '',
    rating: 5,
    playerNotes: ''
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const currentYear = new Date().getFullYear()

  useEffect(() => {
    if (game) {
      setFormData({
        yearPlayed: game.yearPlayed || currentYear,
        startDate: game.startDate || '',
        endDate: game.endDate || '',
        hoursPlayed: game.hoursPlayed || '',
        chaptersWatched: game.chaptersWatched || '',
        rating: game.rating ?? 5,
        playerNotes: game.playerNotes || ''
      })
    }
  }, [game, currentYear])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['yearPlayed', 'hoursPlayed', 'chaptersWatched', 'rating'].includes(name) ? Number(value) : value
    }))
  }

  const handleConfirm = (e) => {
    e.preventDefault()
    onConfirm(formData)
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(game.id, game.name)
    }
    setShowDeleteConfirm(false)
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  if (!game) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-edit">
          <h2>Editar: {game.name}</h2>
          <button 
            className="delete-button-modal"
            onClick={handleDelete}
            title="Eliminar elemento"
          >
            🗑️
          </button>
        </div>

        <form onSubmit={handleConfirm}>
          <div className="form-grid">
            {/* Año jugado / visto */}
            <div className="form-group">
              <label htmlFor="yearPlayed">{currentSection === 'games' ? 'Año jugado' : 'Año visto'}</label>
              <input
                type="number"
                id="yearPlayed"
                name="yearPlayed"
                min="1980"
                max={currentYear}
                value={formData.yearPlayed}
                onChange={handleChange}
              />
            </div>

            {/* Fecha inicio y Fecha fin (solo para juegos) / Capítulos (solo para animes) */}
            {currentSection === 'games' ? (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Fecha de inicio</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">Fecha de fin</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="chaptersWatched">Capítulos vistos</label>
                <input
                  type="number"
                  id="chaptersWatched"
                  name="chaptersWatched"
                  min="0"
                  value={formData.chaptersWatched}
                  onChange={handleChange}
                  placeholder="Ej: 12"
                />
              </div>
            )}

            {/* Horas jugadas */}
            {currentSection === 'games' && (
              <div className="form-group">
                <label htmlFor="hoursPlayed">Horas consumidas</label>
                <input
                  type="number"
                  id="hoursPlayed"
                  name="hoursPlayed"
                  min="0"
                  step="0.5"
                  value={formData.hoursPlayed}
                  onChange={handleChange}
                  placeholder="Ej: 45.5"
                />
              </div>
            )}

            {/* Rating */}
            <div className="form-group">
              <label htmlFor="rating">
                Puntuación (1-10)
              </label>
              <input
                type="number"
                id="rating"
                name="rating"
                min="1"
                max="10"
                step="0.5"
                value={formData.rating}
                onChange={handleChange}
                placeholder="Ej: 8.5"
              />
            </div>
          </div>

          {/* Notas */}
          <div className="form-group full-width">
            <label htmlFor="playerNotes">Mis impresiones</label>
            <textarea
              id="playerNotes"
              name="playerNotes"
              value={formData.playerNotes}
              onChange={handleChange}
              placeholder="¿Qué te pareció?"
              rows="3"
            />
          </div>

          {/* Botones */}
          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn-confirm">
              Guardar cambios
            </button>
          </div>
        </form>

        {showDeleteConfirm && (
          <div className="delete-confirmation-modal">
            <div className="confirmation-content">
              <p>¿Eliminar "{game.name}"?</p>
              <div className="confirmation-buttons">
                <button className="btn-cancel" onClick={cancelDelete}>Cancelar</button>
                <button className="btn-confirm-delete" onClick={confirmDelete}>Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
