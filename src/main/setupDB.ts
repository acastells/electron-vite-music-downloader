import { BrowserWindow, app, ipcMain } from "electron";
import { Track } from "../vm";

const Store = require("electron-store");

export const dbStore = new Store();

export const setupDB = () => {
	app.whenReady().then(() => {
		ipcMain.on("getTracks", updateToRenderer);
		ipcMain.on("dbDebug", dbDebug);
		ipcMain.on("dbClear", dbClear);
	});
};

export const updateToRenderer = () => {
	const tracks = dbStore.get("tracks");
	const mainWindow = BrowserWindow.getAllWindows()[0];
	mainWindow.webContents.send("tracks", transformObjectToArray(tracks));
};

export const upsertTrack = (track: Track) => {
	dbStore.set(`tracks.${track.id}`, track);
	updateToRenderer();
};

export const getTrack = (trackId: string) => {
	const track = dbStore.get(`tracks.${trackId}`);
	return transformObjectToArray(track)[0]
};

export const getTracks = () => {
	const tracks = dbStore.get("tracks");
	return transformObjectToArray(tracks);
};

const dbDebug = () => {
	console.log(dbStore.get("tracks"));
	updateToRenderer();
};

const dbClear = () => {
	dbStore.clear();
	updateToRenderer();
};

const transformObjectToArray = (obj): Track[] => {
	const arr: Track[] = [];
	for (const key in obj) {
		arr.push(obj[key]);
	}
	return arr;
};