# 🎮 Mi Colección de Juegos

Una aplicación web moderna para descubrir, buscar y guardar tu colección de videojuegos favoritos.

## Características

✨ **Diseño Profesional y Moderno**

- Interfaz oscura elegante con gradientes y animaciones suaves
- Responsive design que funciona en todos los dispositivos
- Animaciones fluidas y transiciones profesionales

🎯 **Funcionalidades**

- 🔍 Búsqueda en tiempo real con la API de RAWG
- 📚 Guarda tu biblioteca de juegos en localStorage
- ⭐ Visualiza ratings y información de cada juego
- 🎨 Diseño limpio con componentes reutilizables

## Tecnologías

- **React 18** - Framework principal
- **Vite** - Build tool rápido
- **CSS3** - Estilos con animaciones avanzadas
- **RAWG API** - Base de datos de videojuegos

## Instalación

1. Clona o descarga el proyecto
2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

4. Abre tu navegador en `http://localhost:3000`

## Scripts

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run preview` - Vista previa de la compilación

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Header.jsx
│   ├── SearchBar.jsx
│   ├── GameCard.jsx
│   ├── GameGrid.jsx
│   └── GameLibrary.jsx
├── styles/             # Estilos CSS
│   ├── global.css
│   ├── App.css
│   ├── Header.css
│   ├── SearchBar.css
│   ├── GameCard.css
│   └── GameLibrary.css
├── main.jsx           # Punto de entrada
└── App.jsx            # Componente principal
```

## Cómo usar

1. **Buscar juegos**: Escribe el nombre de un juego en la barra de búsqueda
2. **Agregar a biblioteca**: Haz clic en "+ Agregar" en cualquier tarjeta
3. **Ver biblioteca**: Tu biblioteca guardada aparece en la sección "Mi Biblioteca"
4. **Eliminar juegos**: Haz clic en "🗑️ Eliminar" para remover de tu biblioteca

## Características de Diseño

- 🎨 Gradient oscuro profesional
- ✨ Animaciones en entrada y hover
- 📱 Responsive design mobile-first
- 🔄 Actualización en tiempo real
- 💾 Persistencia con localStorage

## Créditos

- API: [RAWG Video Games Database](https://rawg.io/)
- Diseño: Componentes modernos con React
- Animaciones: CSS3 personalizado

---

**Hecho con ❤️ usando React + Vite**
