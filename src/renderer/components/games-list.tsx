
import preact, { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Icon } from '@iconify/react';

import { GameManager, Game } from '../game';
import Browser from '../browser';
import Input from './input';
import Button from './button';
import Spinner from './spinner';
import Cache from '../cache';
import { Account, AccountManager } from '../account';

function GameEntry({ game, selected, onClick, vip, manager }: 
    { manager: GameManager, game: Game, vip?: string, selected: boolean, onClick: () => void }) {
    const [gameTitle, setGameTitle] = useState(game.title);
    const [gameThumb, setGameThumb] = useState(undefined as unknown as string);
    const [gameDesc, setGameDesc] = useState(undefined as unknown as string);

    const cacheTitleKey = `game-title-${game.id}`;
    const cacheTitle = Cache.get<string>(cacheTitleKey);
    if (!cacheTitle) {
        manager.getGameInformationAsync(game.id).then(info => {
            Cache.set(cacheTitleKey, info.Name);
            game.title = info.Name;
            manager.save();
            setGameTitle(info.Name);
        });
    }

    const cacheThumbKey = `game-thumb-${game.id}`;
    const cacheThumb = Cache.get<string>(cacheThumbKey);
    if (!cacheThumb) {
        manager.getGameThumbnailAsync(game.id).then(url => {
            Cache.set(cacheThumbKey, url);
            setGameThumb(url);
        });
    }

    const cacheDescKey = `game-desc-${game.id}`;
    const cacheDesc = Cache.get<string>(cacheDescKey);
    if (!cacheDesc) {
        manager.getGameInformationAsync(game.id).then(info => {
            Cache.set(cacheDescKey, info.Description);
            setGameDesc(info.Description);
        });
    }

    return <div>
        <div className={`flex items-center p-2 gap-2 rounded ${selected ? 'bg-green-500 dark:bg-green-700' : 'bg-zinc-50 dark:bg-zinc-700'} hover:shadow-md hover:cursor-pointer transition-shadow`}
        onClick={onClick}>
            {((gameThumb && <img src={gameThumb} className="h-12 rounded"></img>) || <Spinner/>)}
            <div>
                <div className={`${selected ? 'text-white' : 'dark:text-white'} text-xl font-bold`}>{gameTitle}</div>
                <div className={`${selected ? 'text-white' : 'text-gray-400 dark:text-zinc-300'}`}>{(gameDesc && `${gameDesc.substring(0, 42)}...`) || game.id}</div>
            </div>
        </div>
    </div> 
}

function GamesList({ gameManager, accountManager }: { gameManager: GameManager, accountManager: AccountManager }) {
    const [listedGames, setListedGames] = useState([...gameManager.games()]);
    const [selectedGame, setSelectedGame] = useState<Game | undefined>(listedGames[0]);

    useEffect(() => {
        gameManager.on('game-mount', (game: Game) => {
            setListedGames([...gameManager.games()]);
            setSelectedGame(game);
        });
    
        gameManager.on('game-unmount', (game: Game) => {
            setListedGames([...gameManager.games()]);
            setSelectedGame(gameManager.games()[0]);
        });
    }, [])

    function selectGame(game: Game) {
        setSelectedGame(game);
        gameManager.emit('game-selected', game);
    }

    function addGame(game: Game) {
        gameManager.mount(game);
    }

    function chooseGameToAdd() {
        if (accountManager.selected) {
            const account = accountManager.selected;
            const addBrowser = new Browser('Add game to list', `addGame-${account.username}`);
            addBrowser.start('https://www.roblox.com/discover', [{ name: '.ROBLOSECURITY', value: account.cookie }]);
            addBrowser.protocol('roblox-player', (url) => {
                addBrowser.close();
                
                const decodedUrl = decodeURIComponent(url); // placeId=6299805723
                const placeidMatch = decodedUrl.match(/placeId=(\d+)/)?.[1];
                if (placeidMatch) {
                    const tryParse = parseInt(placeidMatch);
                    if (!isNaN(tryParse)) {
                        addGame({ id: tryParse });
                    }
                }
            });
        }
    }

    function quickJoin(account?: Account) {
        if (!account) { return }
        const joinBrowser = new Browser('Quick Join', `quickJoin-${account.username}`);
        joinBrowser.start('https://www.roblox.com/discover/', [{ name: '.ROBLOSECURITY', value: account.cookie }]);
        joinBrowser.protocol('roblox-player', (url) => {
            joinBrowser.close();
            Browser.native(url);
        });
    }

    function joinSelected(account?: Account) {
        if (account && selectedGame) {
            accountManager.generateJoinLink(account, selectedGame.id).then(url => Browser.native(url));
        }
    }

    return (
        <div className="flex flex-col gap-2 h-full">
            <div className='flex w-full gap-2'>
                <Input classes="grow" value="" id="jobid" placeholder='Search for game'/>
                <Button onClick={() => chooseGameToAdd()}><Icon className='text-xl' icon="fluent:add-20-filled"/></Button>
            </div>
            <div className='flex flex-col h-0 gap-2 grow overflow-scroll overflow-x-hidden'>
                {listedGames.map(game => 
                    <GameEntry key={game.id} manager={gameManager} game={game} selected={game === selectedGame} onClick={() => selectGame(game)}/> 
                )}
            </div>
            <div className='flex w-full gap-2'>
                <Input classes="grow" id="jobid" placeholder='Job ID (optional)'/>
                <Button>Join JobId</Button>
                <Button onClick={() => joinSelected(accountManager.selected)}>Join Selected</Button>
            </div>
            <div className="flex w-full">
                <Button main onClick={() => quickJoin(accountManager.selected)} classes='grow'><Icon className='pr-1 text-2xl' icon="fluent:plug-connected-20-filled"
                />Quick Join</Button>
            </div>
        </div>)
}

export default GamesList;