
import fetch from 'node-fetch';
import { EventEmitter } from 'events';
import dayjs from 'dayjs';
import * as yup from 'yup';

import Storage from './storage';
import { endpoints, resolveEndpoint } from './endpoints';

export interface Account {
    /* Account user ID. Cannot be updated. */
    readonly id: number;

    /* Last reported username. Can be updated. */
    username: string;

    /* Currently available cookie. */
    cookie: string;
}

export type AccountManagerEvents = 'account-created' | 'account-removed' | 'account-selected';

const accountStoreSchema = yup.array().of(yup.object().shape({
    id: yup.number().positive().required(),
    username: yup.string().required(),
    cookie: yup.string().required()
}));

export class AccountManager {
    private events: EventEmitter = new EventEmitter();
    on(event: AccountManagerEvents, callback: (...args: any[]) => void) {
        this.events.on(event, callback);
    }
    emit(event: AccountManagerEvents, ...args: any[]) {
        this.events.emit(event, ...args);
    }

/*
*   =================================
*   Endpoint connections
*   Interact with Roblox's APIs
*   =================================
*/

    /* Used to simulate a user connection. */
    private readonly refUri = "https://www.roblox.com/games/606849621/Jailbreak";

    private buildHeaders<T extends {}>(account: Account, object?: T): T & { cookie: string } {
        return Object.assign({ cookie: `.ROBLOSECURITY=${account.cookie}` }, object ?? {}) as any;
    }

    async getUserInfoFromCookieAsync(cookie: string): Promise<{ username: string, userId: number }> {
        const endpoint = resolveEndpoint(endpoints.getUserInfo, []);
        const request = await (await fetch(endpoint, { headers: { cookie: `.ROBLOSECURITY=${cookie}`}})).json() as { UserID: number, UserName: string };
        return { username: request.UserName, userId: request.UserID };
    }

    async getUserIdByUsernameAsync(username: string): Promise<number> {
        const endpoint = resolveEndpoint(endpoints.getUserIdByUsername, [username]);
        const request = await (await fetch(endpoint)).json() as { Id: number };
        return request.Id;
    }

    async getCsrfTokenAsync(account: Account): Promise<string | undefined> {
        const authEndpoint = resolveEndpoint(endpoints.getAuthenticationTicket, []);
        const anyGameReq = await fetch(authEndpoint, {
            headers: this.buildHeaders(account, { referer: this.refUri })
        });
        return anyGameReq.headers.get('x-csrf-token') ?? undefined;
    }

    async getAuthenticationTicketAsync(account: Account): Promise<string> {
        const csrf = await this.getCsrfTokenAsync(account);
        if (!csrf) {
            throw new Error('Failed to obtain x-csrf-token.');
        }

        const authEndpoint = resolveEndpoint(endpoints.getAuthenticationTicket, []);
        const authReq = await fetch(authEndpoint, {
            method: 'POST',
            headers: this.buildHeaders(account, {
                referer: this.refUri,
                'X-CSRF-TOKEN': csrf
            })
        });

        const ticket = authReq.headers.get('rbx-authentication-ticket');
        if (!ticket) {
            throw new Error('Failed to obtain authentication ticket.');
        }
        return ticket;
    }

    async getHeadshotImageUrl(account: Account): Promise<string> {
        const headshotEndpoint = resolveEndpoint(endpoints.getAvatarBust, [account.id.toString(), '48x48']);
        const headshotReq = await (await fetch(headshotEndpoint)).json() as { data: { imageUrl: string }[] };
        console.log(headshotReq);
        return headshotReq.data[0].imageUrl;
    }

/*
*   =================================
*   Local account management
*   Loads, saves, and manages accs
*   =================================
*/

    private mountedAccounts: Account[];
    accounts(): readonly Account[] {
        return this.mountedAccounts;
    }

    exists(account: Account): Account | undefined {
        return this.mountedAccounts.find(acc => acc.id === account.id);
    }

    saveAccounts() {
        Storage.write('accounts.json', JSON.stringify(this.mountedAccounts));
    }

    unmountAccount(account: Account) {
        this.mountedAccounts = this.mountedAccounts.filter(acc => acc !== account);
        this.saveAccounts();
    }

    mountAccountsFromStorage() {
        const preliminaryReadJson = Storage.read('accounts.json');
        if (preliminaryReadJson) {
            const preliminaryRead = JSON.parse(preliminaryReadJson);
            if (accountStoreSchema.isValidSync(preliminaryRead)) {
                this.mountedAccounts = preliminaryRead as Account[];
            } else {
                console.warn("Couldn't mount accounts due to file corruption.");
            }
        }
    }

    async mountAccountFromCookieAsync(cookie: string): Promise<Account> {
        const userInfo = await this.getUserInfoFromCookieAsync(cookie);

        const newAccount: Account = {
            username: userInfo.username,
            id: userInfo.userId,
            cookie: cookie
        };

        const existingAccount = this.exists(newAccount);
        if (existingAccount !== undefined) {
            Object.assign(existingAccount, newAccount);
        } else {
            this.mountedAccounts.push(newAccount);
        }

        this.emit('account-created', existingAccount ?? newAccount);
        this.saveAccounts();
        return newAccount;
    }

    constructor() {
        this.mountedAccounts = [];
    }
}