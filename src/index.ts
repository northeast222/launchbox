
import { app, BrowserWindow, WebContents, ipcMain, session, nativeTheme, Session, shell } from "electron";
import path from 'path';

// Launches the GUI.
function guiMain() {
    nativeTheme.themeSource = 'light';
    app.whenReady().then(() => {
        const mainWindow = new BrowserWindow({
            width: 900,
            height: 600,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        const windows: Record<string, BrowserWindow> = {};
        const owners: Record<string, WebContents> = {};
        const sessionMap: Record<string, Session> = {};
        const storedSessions: Record<string, Session> = {};

        ipcMain.on('browser-close', (event, name: string) => {
            const window = windows[name];
            if (window !== undefined) {
                window.close();
            }
        });

        ipcMain.on('browser-protocol', (event, name: string, protocol: string) => {
            sessionMap[name].protocol.registerHttpProtocol(protocol, (req, res) => {
                owners[name]?.send('browser-protocol', name, protocol, req.url);
            });
        });

        ipcMain.on('browser-native', (event, uri: string) => {
            shell.openExternal(uri);
        });

        let partitionCounter = 0;
        ipcMain.on('browser-open', (event, 
                name: string, 
                defaultUri: string, 
                defaultPartition?: string, 
                defaultCookies?: Array<{name: string, value: string}>,
                startHidden?: boolean) => {

            const partition = defaultPartition ? `persist:${defaultPartition}` : `${++partitionCounter}`;
            const ses = session.fromPartition(partition);
            storedSessions[partition] = ses;
            sessionMap[name] = ses;

            if (defaultCookies) {
                defaultCookies.forEach(cookie => {
                    ses.cookies.set({
                        name: cookie.name,
                        value: cookie.value,
                        path: '/',
                        domain: '.roblox.com',
                        url: 'https://www.roblox.com',
                        httpOnly: true
                    });
                });
            }

            const subwin = new BrowserWindow({
                width: 900,
                height: 700,
                autoHideMenuBar: true,
                title: name,
                center: true,
                icon: './src/Roblox.ico',
                show: startHidden ?? true,
                webPreferences: {
                    partition: partition
                }
            })

            subwin.on('closed', () => { 
                owners[name]?.send('browser-close', name);
                delete windows[name];
                delete owners[name];
                delete sessionMap[name];
            });

            subwin.webContents.on('did-navigate', async () => { 
                const url = subwin.webContents.getURL();
                const cookieList = await subwin.webContents.session.cookies.get({});
                const cookieObject = cookieList.map(cookie => ({ name: cookie.name, value: cookie.value }));
                owners[name]?.send('browser-navigated', name, url, cookieObject);
            });

            windows[name] = subwin;
            owners[name] = event.sender;
            subwin.loadURL(defaultUri);
        });

        mainWindow.loadFile("./dist/renderer/base.html");
    });

    app.on('window-all-closed', () => app.quit());
}

guiMain();