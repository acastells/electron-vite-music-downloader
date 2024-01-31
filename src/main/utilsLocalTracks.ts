import { app, ipcMain } from "electron";
import { Track, TrackTypeObject } from "./../vm";
import { log } from "./logger";
import { removeTrack } from "./setupDB";
import { downloadTrack } from "./setupYtdlp";
const fs = require("fs");
const { exec } = require("child_process");

export const setupUtilsLocalTracks = () => {
	app.whenReady().then(() => {
		ipcMain.on("playTrack", playTrack);
		ipcMain.on("hideTrack", hideTrack);
		ipcMain.on("retryTrack", retryTrack);
		ipcMain.on("deleteTrack", deleteTrack);
	});
};

const playTrack = (_event, track: Track) => {
	exec(`start wmplayer "${track.path}"`, (error) => {
		if (error) {
			log(JSON.stringify(error));
		}
	});
};

const hideTrack = (_event, track: Track) => {
	removeTrack(track);
};

const retryTrack = (_event, track: Track) => {
	removeTrack(track);
	try {
		fs.unlinkSync(track.path);
		log(`File ${track.path} is deleted`);
	} catch (err) {
		log(JSON.stringify(err));
	}
	downloadTrack(null, { name: track.originalName, type: TrackTypeObject.ByName });
};

const deleteTrack = (_event, track: Track) => {
	removeTrack(track);
	try {
		fs.unlinkSync(track.path);
		log(`File ${track.path} is deleted`);
	} catch (err) {
		log(JSON.stringify(err));
	}
};
