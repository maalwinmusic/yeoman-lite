import { contextBridge, ipcRenderer } from 'electron';
import { __NAMEPASCAL__API } from '../common/types/api/__NAME__-api';

const api: __NAMEPASCAL__API = {
    closeWindow: () => ipcRenderer.send('close-window')
}

contextBridge.exposeInMainWorld('__NAMEPASCAL__API', api);