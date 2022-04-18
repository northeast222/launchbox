
import { app, BrowserWindow, WebContents, ipcMain, session, nativeTheme } from "electron";
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

        ipcMain.on('browser-close', (event, name: string) => {
            const window = windows[name];
            if (window !== undefined) {
                window.close();
            }
        });

        let partitionCounter = 0;
        ipcMain.on('browser-open', (event, name: string, defaultUri: string) => {
            const subwin = new BrowserWindow({
                width: 900,
                height: 700,
                autoHideMenuBar: true,
                title: name,
                center: true,
                icon: './src/Roblox.ico',
                webPreferences: {
                    partition: `${++partitionCounter}`
                }
            })

            subwin.on('closed', () => { 
                owners[name]?.send('browser-close', name);
                delete windows[name];
                delete owners[name];
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