
import noblox from 'noblox.js';
import fetch from 'node-fetch';
import { EventEmitter } from 'events';
import * as yup from 'yup';

import { endpoints, resolveEndpoint } from './endpoints';
import Storage from "./storage";

export interface Game {
    /* Last cached title. */
    title?: string;

    /* Place id. Used to retrieve place information. */
    id: number;
}

export type GameManagerEvents = 'game-mount' | 'game-unmount' | 'game-join' | 'game-selected';

const gameStoreSchema = yup.array().of(yup.object().shape({
    title: yup.string().optional(),
    id: yup.number().positive().required()
}));

export class GameManager {
/*
*   =================================
*   Games endpoint
*   Get game info stuff also launch them
*   =================================
*/

    async getGameInformationAsync(placeid: number) {
        return await noblox.getProductInfo(placeid);
    }

    async getGameThumbnailAsync(placeid: number) {
        const endpoint = resolveEndpoint(endpoints.getPlaceIcon, [placeid.toString()]);
        const thumbReq = await (await fetch(endpoint)).json() as { data: {imageUrl: string}[] };
        return thumbReq.data[0].imageUrl;
    }

/*
*   =================================
*   Local games management
*   Loads, saves, and manages games
*   =================================
*/

    private events: EventEmitter = new EventEmitter();
    public on(event: GameManagerEvents, callback: (...args: any[]) => void) {
        this.events.on(event, callback);
    }
    public emit(event: GameManagerEvents, ...args: any[]) {
        this.events.emit(event, ...args);
    }

    private mountedGames: Game[];
    public games(): readonly Game[] {
        return this.mountedGames;
    }

    public save() {
        Storage.write('games.json', JSON.stringify(this.mountedGames));
    }

    public mountFromStorage(): readonly Game[] {
        const preliminaryReadJson = Storage.read('games.json');
        if (preliminaryReadJson) {
            const preliminaryRead = JSON.parse(preliminaryReadJson);
            if (gameStoreSchema.isValidSync(preliminaryRead)) {
                this.mountedGames = preliminaryRead as Game[];
            } else {
                console.warn("Couldn't mount games due to file corruption.");
            }
        }
        return this.mountedGames;
    }

    public mount(game: Game) {
        this.mountedGames.push(game);
        this.save();
        this.emit('game-mount', game);
    }

    public unmount(game: Game) {
        this.mountedGames = this.mountedGames.filter(gm => gm !== game);
        this.save();
        this.emit('game-unmount', game);
    }

    public constructor() {
        this.mountedGames = [];
    }
}

export default GameManager;