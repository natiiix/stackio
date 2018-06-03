const { ipcRenderer } = require('electron');

ipcRenderer.on('append-output', (event: Electron.Event, str: string) =>
    document.getElementById('output').innerHTML += str.replace(/\n/g, '<br>')
);

document.getElementById('run').addEventListener('click', (e) => {
    runCode();
});

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.code === 'Enter') {
        runCode();
    }
});

function runCode(): void {
    const code = (document.getElementById('code') as HTMLTextAreaElement).value;
    ipcRenderer.send('run-code', code);
}
