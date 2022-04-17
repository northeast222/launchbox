
import React, { useState } from 'react';
import { GameManager, Game } from '../game';

function GamesList({ gameManager }: { gameManager: GameManager }) {
    const [listedGames, setListedGames] = useState([
        {
            title: 'Classic: Crossroads',
            id: 1818
        },
        {
            title: 'Classic: Crossroads',
            id: 1818
        },
        ...gameManager.games()]);
    const [selectedGame, setSelectedGame] = useState<Game>(listedGames[0]);

    function selectGame(game: Game) {
        setSelectedGame(game);
        gameManager.emit('game-selected', game);
    }

    return <div className='flex flex-col gap-2'>
            {listedGames.map(game => 
                <div>
                    <div className={`flex items-center p-2 gap-2 rounded ${game === selectedGame ? 'bg-green-500' : 'bg-zinc-50'} hover:shadow-md hover:cursor-pointer transition-shadow`}
                    onClick={() => selectGame(game)}>
                        <div>
                            <div className={`${game === selectedGame ? 'text-white' : ''} text-xl font-bold`}>{game.title}</div>
                            <div className={`${game === selectedGame ? 'text-white' : 'text-gray-400'}`}>{game.id}</div>
                        </div>
                    </div>
                </div>   
            )}
        </div>
}

export default GamesList;