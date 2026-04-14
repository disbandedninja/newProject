const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('incidentApi', {
  listIncidents: (filters) => ipcRenderer.invoke('incidents:list', filters),
  addIncident: (incident) => ipcRenderer.invoke('incidents:add', incident),
  getOptions: () => ipcRenderer.invoke('incidents:options')
});
