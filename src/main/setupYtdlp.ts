import { app, ipcMain } from "electron";
import path from "path";
const fs = require("fs");
const YTDlpWrap = require("yt-dlp-wrap").default; // TS version does not work

export const setupYtdlp = () => {
	const binaryPath = path.join(app.getPath("appData"), "Music Downloader", "yt-dlp.exe");

	app.whenReady().then(() => {
		ipcMain.on("download_dlp", setupDlp);
		ipcMain.on("download", downloadTrack);
	});

	const setupDlp = async () => {
		YTDlpWrap.downloadFromGithub(binaryPath).then(() => {
			console.log("yt-dlp.exe downloaded");
		});
	};

	const downloadTrack = () => {
		const ytDlpWrap = new YTDlpWrap(binaryPath);
		console.log(ytDlpWrap);
	};
};
