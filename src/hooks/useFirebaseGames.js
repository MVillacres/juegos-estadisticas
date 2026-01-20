import { useState, useCallback, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";

export function useFirebaseGames(userId, type = "games") {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar juegos en tiempo real
  useEffect(() => {
    if (!userId) {
      setGames([]);
      setLoading(false);
      return;
    }

    try {
      const gamesRef = collection(db, "users", userId, type);

      // Escuchar cambios en tiempo real
      const unsubscribe = onSnapshot(gamesRef, (snapshot) => {
        const gamesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGames(gamesList);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error loading games:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [userId, type]);

  // Agregar juego
  const addGame = useCallback(
    async (gameData) => {
      if (!userId) throw new Error("User not authenticated");

      try {
        const gamesRef = collection(db, "users", userId, type);
        const docRef = await addDoc(gamesRef, {
          ...gameData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        return docRef.id;
      } catch (err) {
        console.error("Error adding game:", err);
        throw err;
      }
    },
    [userId, type]
  );

  // Actualizar juego
  const updateGame = useCallback(
    async (gameId, updates) => {
      if (!userId) throw new Error("User not authenticated");

      try {
        const gameRef = doc(db, "users", userId, type, gameId);
        await updateDoc(gameRef, {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Error updating game:", err);
        throw err;
      }
    },
    [userId, type]
  );

  // Eliminar juego
  const deleteGame = useCallback(
    async (gameId) => {
      if (!userId) throw new Error("User not authenticated");

      try {
        const gameRef = doc(db, "users", userId, type, gameId);
        await deleteDoc(gameRef);
      } catch (err) {
        console.error("Error deleting game:", err);
        throw err;
      }
    },
    [userId, type]
  );

  // Exportar datos
  const exportGames = useCallback(() => {
    try {
      const dataStr = JSON.stringify(games, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `juegos-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error("Error exporting games:", err);
      return false;
    }
  }, [games]);

  // Importar datos
  const importGames = useCallback(
    async (file) => {
      return new Promise(async (resolve, reject) => {
        try {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const importedGames = JSON.parse(e.target.result);
              if (!Array.isArray(importedGames)) {
                throw new Error("Invalid format: expected array");
              }

              // Agregar todos los juegos
              for (const game of importedGames) {
                const { id, createdAt, updatedAt, ...gameData } = game;
                await addGame(gameData);
              }
              resolve(true);
            } catch (parseError) {
              reject(new Error("Invalid JSON format"));
            }
          };
          reader.onerror = () => reject(new Error("Error reading file"));
          reader.readAsText(file);
        } catch (error) {
          reject(error);
        }
      });
    },
    [addGame]
  );

  return {
    games,
    loading,
    error,
    addGame,
    updateGame,
    deleteGame,
    exportGames,
    importGames,
  };
}
