import GameCard from './GameCard'
import '../styles/GameGrid.css'

export default function GameGrid({ games }) {
  return (
    <div className="game-grid">
      {games.map((game) => (
        game.background_image && (
          <GameCard key={game.id} game={game} isSearchResult={true} />
        )
      ))}
    </div>
  )
}
