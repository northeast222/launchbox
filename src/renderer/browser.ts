
import { ipcRenderer, StartLoggingOptions } from 'electron'
import { EventEmitter } from 'events';

export type BrowserEvents = 'message' | 'navigated' | 'closed';

export interface BrowserCookie {
    name: string;
    value: string;
}

const browserList: Record<string, Browser> = {};
export class Browser {
    public readonly name: string;

    private events: EventEmitter = new EventEmitter();
    public on(event: BrowserEvents, callback: (...args: any[]) => void) {
        this.events.on(event, callback);
    }
    public emit(event: BrowserEvents, ...args: any[]) {
        this.events.emit(event, ...args);
    }

    private uriInternal: string = 'about:blank';
    public get uri() { return this.uriInternal; }

    private cookiesInternal: BrowserCookie[] = [];
    public get cookies(): readonly BrowserCookie[] { return this.cookiesInternal; }

    public start(defaultUri: string) {
        browserList[this.name] = this;

        this.on('navigated', (uri: string, cookies: BrowserCookie[]) => {
            this.uriInternal = uri;
            this.cookiesInternal = cookies;
        });

        ipcRenderer.send('browser-open', this.name, defaultUri);
    }

    public close() {
        ipcRenderer.send('browser-close', this.name);
    }

    public dispose() {
        delete browserList[this.name];
    }

    public constructor(name: string) {
        this.name = name;
    }
}

ipcRenderer.on('browser-message', (event, name: string, ...args: any[]) => {
    const existingBrowser = browserList[name];
    if (existingBrowser !== undefined) {
        existingBrowser.emit('message', ...args);
    }
});

ipcRenderer.on('browser-close', (event, name: string, ...args: any[]) => {
    const existingBrowser = browserList[name];
    if (existingBrowser !== undefined) {
        existingBrowser.emit('closed', ...args);
        existingBrowser.dispose();
    }
});

ipcRenderer.on('browser-navigated', (event, name: string, uri: string, cookies: BrowserCookie[]) => {
    const existingBrowser = browserList[name];
    if (existingBrowser !== undefined) {
        existingBrowser.emit('navigated', uri, cookies);
    }
});

