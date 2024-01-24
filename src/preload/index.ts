import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";

export type ContextBridgeApi = {
	// Declare a `readFile` function that will return a promise. This promise
	// will contain the data of the file read from the main process.
	send: (channel) => void;
	receive: (channel, func) => void;
};

// Custom APIs for renderer
const exposedApi: ContextBridgeApi = {
	send: (channel) => {
		ipcRenderer.send(channel)
	},
	receive: (channel, func) => {
		ipcRenderer.on(channel, (_event, ...args) => func(...args));
	},
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld("electron", electronAPI);
		contextBridge.exposeInMainWorld("api", exposedApi);
	} catch (error) {
		console.error(error);
	}
} else {
	// @ts-ignore (define in dts)
	window.electron = electronAPI;
	// @ts-ignore (define in dts)
	window.api = api;
}
