import { useState, useEffect } from "react";

export function useViewPreference() {
  const [viewMode, setViewMode] = useState("grid");
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar preferencia guardada
  useEffect(() => {
    const saved = localStorage.getItem("gameLibraryViewMode");
    if (saved) {
      setViewMode(saved);
    }
    setIsLoaded(true);
  }, []);

  // Guardar preferencia cuando cambia
  const updateViewMode = (newMode) => {
    setViewMode(newMode);
    localStorage.setItem("gameLibraryViewMode", newMode);
  };

  return { viewMode, updateViewMode, isLoaded };
}
