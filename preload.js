const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  startSearch: (config) => ipcRenderer.invoke('start-search', config)
});

