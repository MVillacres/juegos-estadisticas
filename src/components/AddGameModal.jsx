import React, { useState } from 'react';
import '../styles/AddGameModal.css';

export default function AddGameModal({ game, onConfirm, onCancel, currentSection = 'games' }) {
  const [formData, setFormData] = useState({
    playerNotes: '',
    yearPlayed: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    hoursPlayed: '',
    chaptersWatched: '',
    rating: game?.rating || 5,
    order: Date.now() // Usar timestamp como valor de orden inicial
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearPlayed' || name === 'hoursPlayed' || name === 'chaptersWatched' || name === 'rating' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(formData);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Agregar "{game?.name}" a tu colección</h2>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="yearPlayed">{currentSection === 'games' ? 'Año agregado:' : 'Año visto:'}</label>
            <input
              type="number"
              id="yearPlayed"
              name="yearPlayed"
              value={formData.yearPlayed}
              onChange={handleChange}
              min="1980"
              max={new Date().getFullYear()}
            />
          </div>

          {currentSection === 'games' ? (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Fecha de inicio:</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">Fecha de finalización:</label>
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
              <label htmlFor="chaptersWatched">Capítulos vistos:</label>
              <input
                type="number"
                id="chaptersWatched"
                name="chaptersWatched"
                value={formData.chaptersWatched}
                onChange={handleChange}
                min="0"
                placeholder="Ej: 12"
              />
            </div>
          )}

          {currentSection === 'games' && (
            <div className="form-group">
              <label htmlFor="hoursPlayed">Horas consumidas:</label>
              <input
                type="number"
                id="hoursPlayed"
                name="hoursPlayed"
                value={formData.hoursPlayed}
                onChange={handleChange}
                min="0"
                step="0.5"
                placeholder="Ej: 45.5"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="rating">Mi calificación (1-10):</label>
            <input
              type="number"
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              min="1"
              max="10"
              step="0.5"
              placeholder="Ej: 8.5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="playerNotes">Notas personales:</label>
            <textarea
              id="playerNotes"
              name="playerNotes"
              value={formData.playerNotes}
              onChange={handleChange}
              placeholder="Escribe tus impresiones..."
              rows="4"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn-confirm">Agregar a colección</button>
          </div>
        </form>
      </div>
    </div>
  );
}
