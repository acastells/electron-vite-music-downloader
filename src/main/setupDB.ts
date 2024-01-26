import { BrowserWindow } from "electron";
import { Track } from "../vm";

const Store = require("electron-store");

export const dbStore = new Store();

export const setupDB = () => {
	// dbStore.clear();
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

export const getAllTracks = () => {
	return dbStore.get("tracks");
};

const transformObjectToArray = (obj) => {
    const arr: Track[] = [];
    for (const key in obj) {
        arr.push(obj[key]);
    }
    return arr;
}
