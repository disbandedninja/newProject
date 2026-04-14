const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const {
  listIncidents,
  addIncident,
  getDefaultOptions,
  ensureStore
} = require('./storage');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 860,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  ensureStore(app.getPath('userData'));

  ipcMain.handle('incidents:list', (_event, filters) =>
    listIncidents(app.getPath('userData'), filters)
  );

  ipcMain.handle('incidents:add', (_event, incident) =>
    addIncident(app.getPath('userData'), incident)
  );

  ipcMain.handle('incidents:options', () => getDefaultOptions());

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
