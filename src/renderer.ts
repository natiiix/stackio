const { ipcRenderer } = require('electron');

// IPC Renderer events

ipcRenderer.on('append-output', (event: Electron.Event, str: string) =>
    document.getElementById('output').innerHTML += str.replace(/\n/g, '<br>'));

ipcRenderer.on('change-code', (event: Electron.Event, code: string) => {
    (document.getElementById('code') as HTMLTextAreaElement).value = code;
    M.textareaAutoResize(document.getElementById('code') as HTMLTextAreaElement);
});

// Document events

document.getElementById('run').addEventListener('click', (e) =>
    runCode());

document.getElementById('clear').addEventListener('click', (e) =>
    document.getElementById('output').innerHTML = '');

document.getElementById('load').addEventListener('click', (e) =>
    ipcRenderer.send('load-code'));

document.getElementById('save').addEventListener('click', (e) =>
    ipcRenderer.send('save-code', getCode()));

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.code === 'Enter') {
        runCode();
    }
});

// Helper functions

function getCode(): string {
    return (document.getElementById('code') as HTMLTextAreaElement).value;
}

function runCode(): void {
    ipcRenderer.send('run-code', getCode());
}
