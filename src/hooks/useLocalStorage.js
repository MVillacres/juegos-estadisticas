import { useState, useEffect, useCallback } from "react";

export function useLocalStorage(key, initialValue) {
  // Estado para almacenar el valor
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Función para actualizar el valor
  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          // Disparar evento global para sincronización
          window.dispatchEvent(new Event("storageUpdated"));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Sincronizar cuando cambia el localStorage en otra pestaña
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Error syncing storage:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  // Función para exportar a JSON
  const exportToJSON = useCallback(() => {
    try {
      const dataStr = JSON.stringify(storedValue, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${key}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Error exporting JSON:", error);
      return false;
    }
  }, [storedValue, key]);

  // Función para importar desde JSON
  const importFromJSON = useCallback(
    (file) => {
      return new Promise((resolve, reject) => {
        try {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const importedData = JSON.parse(e.target.result);
              setValue(importedData);
              resolve(true);
            } catch (parseError) {
              reject(new Error("Formato JSON inválido"));
            }
          };
          reader.onerror = () => reject(new Error("Error al leer el archivo"));
          reader.readAsText(file);
        } catch (error) {
          reject(error);
        }
      });
    },
    [setValue]
  );

  return [storedValue, setValue, { exportToJSON, importFromJSON }];
}
