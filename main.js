const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { VanitySearchModule } = require('./vanity_search_module');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('start-search', async (event, config) => {
  const vanitySearch = new VanitySearchModule(
    config.searchRange.start,
    config.searchRange.end,
    config.addresses,
    config.maxConsecutiveRepeats
  );

  try {
    const results = await vanitySearch.search();
    vanitySearch.destroy();
    return results;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
});

