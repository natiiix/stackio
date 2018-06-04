import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { Runner } from './Runner';
import { readFile, writeFile } from 'fs';

const CODE_FILE = path.join(app.getAppPath(), 'code.sio');

let mainWindow: Electron.BrowserWindow;

ipcMain.on('run-code', (event: Electron.Event, code: string) => {
    (new Runner(code, x => event.sender.send('append-output', x))).run();
});

ipcMain.on('load-code', (event: Electron.Event) => {
    readFile(CODE_FILE, (err, data) => event.sender.send('change-code', data.toString()));
});

ipcMain.on('save-code', (event: Electron.Event, code: string) => {
    writeFile(CODE_FILE, code, logIfErr);
});

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, '../view/index.html'));

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

function logIfErr(err: Error): void {
    if (err) {
        console.error(err);
    }
}
