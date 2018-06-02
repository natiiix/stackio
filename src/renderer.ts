const { ipcRenderer } = require('electron');

ipcRenderer.on('print-output', (event: Electron.Event, str: string) =>
    document.getElementById('output').innerHTML = str.replace(/\n/g, '<br>')
);

document.getElementById('run').addEventListener('click', (e) => {
    const code = (document.getElementById('code') as HTMLTextAreaElement).value;
    ipcRenderer.send('run-code', code);
});
