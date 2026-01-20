import React from 'react';
import '../styles/DataManager.css';

export default function DataManager({ onExport, onImport }) {
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="data-manager">
      <button className="btn-export" onClick={onExport} title="Descargar datos en JSON">
        💾 Exportar
      </button>
      <label className="btn-import" title="Cargar datos desde JSON">
        📂 Importar
        <input
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
}
